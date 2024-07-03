"use strict";

import {jwtDecode} from "jwt-decode";
import * as btoa from "btoa";
import * as CryptoJS from "crypto-js";

import * as backoff from "backoff";

import {
    addParamToUrl,
    addPropertyToObj,
    getRandomInt,
    logEntryExit,
    makeId,
    msToTime, orderByFilter,
    stackTrace
} from "../common/Utils.js";
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
import {TimeOutManager} from "../common/TimeOutManager";
import {Group} from "ts-generic-collections-linq";
import {Task} from "../common/models/Task.js";
import {TaskInput} from "../services/TasksService.js";
import {HuntingGroup} from "../common/models/RainbowVoiceCloudPBX.js";

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
    public _logger: Logger;
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
    private timeOutManager: TimeOutManager;
    protected apiConfigTTL: number = 1;
    protected apiConfigTTLTimeout: any = 1;

    static getClassName() { return 'RESTService'; }
    getClassName() { return RESTService.getClassName(); }

    static getAccessorName(){ return 'rest'; }
    getAccessorName(){ return RESTService.getAccessorName(); }

    constructor(core: Core, _options, evtEmitter: EventEmitter, _logger: Logger) {
        super(_logger, LOG_ID);
        let that = this;
        let self = this;
        this.eventEmitter = evtEmitter;

        this._logger = _logger;
        this.restTelephony = new RESTTelephony(evtEmitter, _logger);
        this.restConferenceV2 = new RESTConferenceV2(evtEmitter, _logger);
        this.restWebinar = new RESTWebinar(evtEmitter, _logger);

        this.timeOutManager = core.timeOutManager;
        this.http = null;
        this.account = null;
        this.app = null;
        this.tokenRest = null;
        this.renewTokenInterval = null;
        this._options = _options;
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
        return this.account ? this.account.id:"";
    }

    get loggedInUser() {
        return this.account;
    }

    start(http) {
        let that = this;
        that.http = http;
        let prom: Array<Promise<any>> = [];
        prom.push(that.restTelephony.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restTelephony email used", that.loginEmail);
        }));
        prom.push(that.restConferenceV2.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restConferenceV2 email used", that.loginEmail);
        }));
        prom.push(that.restWebinar.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restWebinar email used", that.loginEmail);
        }));
        return Promise.all(prom);
    }

    stop() {
        let that = this;
        return new Promise(async(resolve, reject) => {
            try {
                await that.restTelephony.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restTelephony.");
                });

                await that.restConferenceV2.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restConferenceV2.");
                });

                await that.restWebinar.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restWebinar.");
                });

                await that.signout().then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(stop) Successfully stopped");
                    resolve(undefined);
                })/* .catch((err) => {
                return reject(err);
            }) */;
            } catch (err) {
                that._logger.log(that.DEBUG, LOG_ID + "(stop) !!! CATCH Error : ", err, ". But send Successfully stopped to upper layer.");
                resolve(undefined);
            }
        });
    }

    async signin(token: string = undefined) {
        let that = this;

        // Login by the token provided in parameter.
        if (token) {
            return await this.getContactByToken(token);
            /*
            try {
                that._logger.log(that.INTERNAL, LOG_ID + "(signin) with token : ", token, " : ", that.getLoginHeader());
                let decodedtoken = jwtDecode(token);
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
                        that._logger.log(that.DEBUG, LOG_ID + "(signin) contact found on server, get full infos.");
                        let _contactFromServer = contactsFromServeur;
                        if (_contactFromServer) {
                            // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                            return await that.getContactInformationByID(_contactFromServer.id).then((_contactInformation: any) => {
                                that._logger.log(that.INTERNAL, LOG_ID + "(signin) contact full infos : ", _contactInformation);
                                return _contactInformation;
                            });
                        }
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(signin) getContactInformationByID no contacts found : ", contactsFromServeur);
                        return Promise.reject(contactsFromServeur);
                    }
                }).catch((errr) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) getContactInformationByLoginEmail Error !!! error : ", errr);
                    return Promise.reject(errr);
                });
                that.account = JSON.loggedInUser = loggedInUser;
                that._logger.log(that.DEBUG, LOG_ID + "(signin) token signin, welcome " + that.account.id + "!");
                that._logger.log(that.INTERNAL, LOG_ID + "(signin) user information ", that.account);
                that._logger.log(that.INTERNAL, LOG_ID + "(signin) application information : ", that.app);
                return Promise.resolve(JSON);
            } catch (err) {
                that._logger.log(that.DEBUG, LOG_ID + "(signin) CATCH Error !!! error : ", err);
                return Promise.reject(err);
            }
            // */
        }
        // If no token is provided, then signin with user/pwd credentials.
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/authentication/v1.0/login", that.getLoginHeader(), undefined).then(async function (JSON) {
                that.account = JSON.loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid:that.account.jid_im;
                that.app = JSON.loggedInApplication;
                that.tokenRest = JSON.token;

                let companyInfo = await that.getCompanyInfos(that.account.companyId, "full", false, undefined, undefined, undefined, undefined, undefined, undefined, undefined).catch((err) => {
                            that._logger.log(that.WARN, LOG_ID + "(signin) failed to get company information : ", err);
                        }
                );
                that.account.company = companyInfo;

                that._logger.log(that.INTERNAL, LOG_ID + "(signin) welcome " + that.account.displayName + "!");
                //that._logger.log(that.DEBUG, LOG_ID + "(signin) user information ", that.account);
                that._logger.log(that.INTERNAL, LOG_ID + "(signin) application information : ", that.app);
                that.getApiConfigurationFromServer();
                resolve(JSON);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(signin) ErrorManager during REST signin");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(signin) ErrorManager during REST signin : ", err);
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
                that._logger.log(that.INTERNAL, LOG_ID + "(askTokenOnBehalf) successfully received token for ", JSON.loggedInUser.id, " !");
                resolve(JSON);
            })
                    .catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(askTokenOnBehalf) Error requesting a token");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(askTokenOnBehalf) Error requesting a token : ", err);
                        return reject(err);
                    });
        });
    }

    /**
     * @public
     * @method getApiConfigurationFromServer
     * @since 2.30.0
     * @instance
     * @async
     * @category CONVERSATIONS
     * @description
     * This API returns settings applying to Rainbow APIs. </br>
     * The first use case of these settings is the configuration of rules allowing to force the clients to use a specific region for some API calls in Rainbow multi-region deployment (to avoid some clustering issues or increase performances).</br>
     * The `additionalHeaders` Array specifies that given header(s) have to be added by the clients when calling APIs being specified in the associated `match` Object (list of APIs with `method` and `url`).</br>
     * The data returned by this API comes from server configuration and can evolve, therefore the clients should periodically refresh the settings kept in their cache. A ttl (time to live) field is returned, indicating the periodicity the clients should refresh their cache.</br>
     *
     * @return {Promise<any>} - result
     *
     *
     */
    //private async getApiConfigurationFromServer() {
    async getApiConfigurationFromServer() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            that._logger.log(that.INFOAPI, LOG_ID + "(getApiConfigurationFromServer) entering.");
            await that.getApisSettings().then(async (apiSettings: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getApiConfigurationFromServer) success");

                const httpUrls = [];
                if (apiSettings?.additionalHeaders) {
                    /* apiSettings.additionalHeaders.forEach((additionalHeader: any) => {
                        additionalHeader.match.forEach((obj) => {
                            httpUrls.push({
                                "url": obj.url.replace("*", ""),
                                "method": obj.method,
                                "headers": additionalHeader.headers
                            });
                        });
                    }); // */
                    for (let i = 0; i < apiSettings.additionalHeaders.length; i++) {
                        const additionalHeader = apiSettings.additionalHeaders[i];
                        for (let j = 0; j < additionalHeader.match.length; j++) {
                            const obj = additionalHeader.match[j];
                            httpUrls.push({
                                "url": obj.url.replace("*", ""),
                                "method": obj.method,
                                "headers": additionalHeader.headers
                            });
                        }
                    }
                }

                that.http.apiHeadersConfiguration = httpUrls;

                that.apiConfigTTL = apiSettings?.ttl;
                if (that.apiConfigTTL) {
                    that.apiConfigTTLTimeout = setTimeout(() => {
                        that.apiConfigTTL = 0;
                        that.getApiConfigurationFromServer();
                    }, that.apiConfigTTL * 1000);
                }
            }).catch((error) => {
                that._logger.log(that.WARN, LOG_ID + "(getApiConfigurationFromServer) Failed to retrieve API settings : ", error);
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getApiConfigurationFromServer) Failed to retrieve API settings : ", error);
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
                    that._logger.log(that.INFO, LOG_ID + "(signout) Successfully signed-out!");
                    resolve(JSON);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "error at signout");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "error at signout : ", err);
                    return reject(err);
                });
            } else {
                that._logger.log(that.WARN, LOG_ID + "(signout) seems to be already signed-out!");
                resolve(null);
            }
        });
    }

    async startTokenSurvey() {

        let that = this;

        let decodedToken : any = jwtDecode(that.token);
        //that._logger.log(that.DEBUG, LOG_ID + "(startTokenSurvey) - token.");
        that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) - token, exp : ", decodedToken.exp, ", iat : ", decodedToken.iat);
        that._logger.log(that.INTERNAL, LOG_ID + "(startTokenSurvey) - token oauth, decodedToken : ", decodedToken);
        if (decodedToken.exp && decodedToken.iat) {
            that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) token decoded : start Date : ", new Date(decodedToken.iat * 1000), ", end Date: ", new Date(decodedToken.exp * 1000), ", token full duration : ", msToTime((decodedToken.exp - decodedToken.iat)*1000));
        }
        let halfExpirationDate = (decodedToken.exp - decodedToken.iat) / 2 + decodedToken.iat;
        let tokenExpirationTimestamp = halfExpirationDate * 1000;
        let expirationDate = new Date(tokenExpirationTimestamp);
        let currentDate = new Date();
        let currentTimestamp = currentDate.valueOf();
        let halftokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;
        let fulltokenExpirationDuration = (decodedToken.exp * 1000) - currentTimestamp;

        let usedExpirationDuration = 0; // Refresh before the token expiration - negative values are well treated by settimeout
        that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) token decoded : expirationDate: " + expirationDate + " currentDate:" + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");

        if (decodedToken && !decodedToken.oauth) {
            if (halftokenExpirationDuration < 0) {
                that._logger.log(that.WARN, LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
                that._renewAuthToken();
            } else {
                let randomTimeToWaitAddedTousedExpirationDurationBeforeRenew = getRandomInt((halftokenExpirationDuration/8) ) ; // add random time to the halftokenExpirationDuration.
                // let timeToRemoveTousedExpirationDurationBeforeRenew = 0 //
                let usedExpirationDuration = halftokenExpirationDuration + randomTimeToWaitAddedTousedExpirationDurationBeforeRenew; // Refresh before the token expiration - negative values are well treated by settimeout
                that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " currentDate: " + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");
                if (that.renewTokenInterval) {
                    that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) remove timer");
                    clearTimeout(that.renewTokenInterval);
                }
                that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start a new timer for renewing token usedExpirationDuration in ", usedExpirationDuration, " ms => ", msToTime(usedExpirationDuration));
                that.renewTokenInterval = that.timeOutManager.setTimeout(function () {
                    that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) renewing token timer elapsed.");
                    that._renewAuthToken();
                }, usedExpirationDuration, "startTokenSurvey 1");
            }
            /* if (halftokenExpirationDuration < 300000) {
                that._logger.log(that.WARN, LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately : ", halftokenExpirationDuration);
                that._renewAuthToken();
            } else {
                let timeToRemoveTousedExpirationDurationBeforeRenew = (halftokenExpirationDuration > 3600000) ? getRandomInt((halftokenExpirationDuration/2) ) : getRandomInt(3600000); // remove 1 hour if the halftokenExpirationDuration is less than 1 hour
                // let timeToRemoveTousedExpirationDurationBeforeRenew = 0 //  
                let usedExpirationDuration = halftokenExpirationDuration - timeToRemoveTousedExpirationDurationBeforeRenew; // Refresh timeToRemoveTousedExpirationDurationBeforeRenew before the token expiration - negative values are well treated by settimeout
                that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " currentDate: " + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");
                if (that.renewTokenInterval) {
                    that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) remove timer");
                    clearTimeout(that.renewTokenInterval);
                }
                that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start a new timer for renewing token in ", usedExpirationDuration, " ms");
                that.renewTokenInterval = that.timeOutManager.setTimeout(function () {
                    that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) renewing token timer elapsed.");
                    that._renewAuthToken();
                }, usedExpirationDuration, "startTokenSurvey 1");
            } // */
        } else if (decodedToken) { // token is from oauth external login, so we can not refresh it by ourself.
            usedExpirationDuration = halftokenExpirationDuration;
            that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start token oauth survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");
            if (fulltokenExpirationDuration < 0) {
                that._logger.log(that.WARN, LOG_ID + "(startTokenSurvey) oauth token has already expired, needs to be re-newed it immediately");
                //that._logger.log(that.INTERNAL, LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenrenewfailed.");
                this.eventEmitter.emit("evt_internal_onusertokenrenewfailed", that.token);
            } else if (halftokenExpirationDuration < 0) {
                that._logger.log(that.WARN, LOG_ID + "(startTokenSurvey) oauth token will expire in half duration of the token in : ", tokenExpirationTimestamp, " minutes, needs to be re-newed it immediately");
                //that._logger.log(that.INTERNAL, LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenwillexpire.");
                this.eventEmitter.emit("evt_internal_onusertokenwillexpire", that.token);
            } else {
                if (that.renewTokenInterval) {
                    that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) remove timer");
                    clearTimeout(that.renewTokenInterval);
                }
                that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) start a new timer for renewing token in ", usedExpirationDuration, " ms");
                that.renewTokenInterval = that.timeOutManager.setTimeout(function () {
                    //that._logger.log(that.INTERNAL, LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenwillexpire.");
                    that.eventEmitter.emit("evt_internal_onusertokenwillexpire", that.token);
                    //that.startTokenSurvey()
                }, usedExpirationDuration, "startTokenSurvey 2");
            }
        } else {
            that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) decodedToken undefined.");
        }
    }

    _renewAuthToken() {
        let that = this;
        that.http.get("/api/rainbow/authentication/v1.0/renew", that.getRequestHeader(), undefined).then(function (JSON) {
            that._logger.log(that.INFO, LOG_ID + "(_renewAuthToken) renew authentication token success");
            that.tokenRest = JSON.token;
            that._logger.log(that.INTERNAL, LOG_ID + "(_renewAuthToken) new token received", that.token);
            that.eventEmitter.emit("evt_internal_tokenrenewed");
        }).catch(function (err) {
            that._logger.log(that.ERROR, LOG_ID, "(_renewAuthToken) renew authentication token failure");
            that._logger.log(that.INTERNALERROR, LOG_ID, "(_renewAuthToken) renew authentication token failure : ", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.eventEmitter.emit("evt_internal_tokenexpired");
        });
    }

    //region Bots

    getRainbowSupportBotService(): any {
        // GET /api/rainbow/enduser/v1.0/bots/rainbow-support
        // API https://api.openrainbow.org/enduser/#api-bots-getRainbowSupport
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots/rainbow-support";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowSupportBotService) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getRainbowSupportBotService) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowSupportBotService) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRainbowSupportBotService) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRainbowSupportBotService) error : ", err);
                return reject(err);
            });
        });
    }

    getABotServiceData(botId: string): any {
        // GET /api/rainbow/enduser/v1.0/bots/:botId
        // API https://api.openrainbow.org/enduser/#api-bots-getBotById
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots/" + botId;
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getABotServiceData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABotServiceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABotServiceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABotServiceData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABotServiceData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBotServices(format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1): any {
        // GET /api/rainbow/enduser/v1.0/bots
        // API https://api.openrainbow.org/enduser/#api-bots-getBots
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBotServices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBotServices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBotServices) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBotServices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBotServices) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion

    //region multifactor rainbow authentication

    deleteTrustedApplication(appId: string) {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication 
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/mfa/trusted/:appId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            //let userId = userId ? userId : that.account.id;
            let userId = that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa/trusted/" + appId;
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTrustedApplication) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTrustedApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTrustedApplication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTrustedApplication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTrustedApplication) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAllTrustedApplications() {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-DeleteAllTrustedApp 
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/mfa/trusted

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            //let userId = userId ? userId : that.account.id;
            let userId = that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa/trusted";
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllTrustedApplications) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAllTrustedApplications) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllTrustedApplications) REST result : ", json?.data);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAllTrustedApplications) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllTrustedApplications) error : ", err);
                return reject(err);
            });
        });
    }

    disableMultifactorAuthentication() {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-DisableMFA 
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/mfa

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            //let userId = userId ? userId : that.account.id;
            let userId = that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa";
            that._logger.log(that.INTERNAL, LOG_ID + "(disableMultifactorAuthentication) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(disableMultifactorAuthentication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(disableMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disableMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    enableMultifactorAuthentication() {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-PutMFA
        // PUT /api/rainbow/enduser/v1.0/users/:userId/mfa

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            let userId = that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa";
            that._logger.log(that.INTERNAL, LOG_ID + "(enableMultifactorAuthentication) args : ", data);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(enableMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableMultifactorAuthentication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    getMultifactorInformation() {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-GetMFA 
        // GET /api/rainbow/enduser/v1.0/users/:userId/mfa

        let that = this;
        return new Promise(function (resolve, reject) {
            //that._logger.log(that.INTERNAL, LOG_ID + "(getMultifactorInformation) REST numberE164 : ", numberE164);
            let userId = that.account.id;

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "pbxId", pbxId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getMultifactorInformation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMultifactorInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMultifactorInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMultifactorInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMultifactorInformation) error : ", err);
                return reject(err);
            });
        });
    }

    verifyMultifactorInformation(token) {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-VerifyMFA 
        // POST /api/rainbow/enduser/v1.0/users/:userId/mfa/verify

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            let userId = that.account.id;

            if (token) {
                data.token = token;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa/verify";
            that._logger.log(that.INTERNAL, LOG_ID + "(verifyMultifactorInformation) args : ", data);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(verifyMultifactorInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(verifyMultifactorInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(verifyMultifactorInformation) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(verifyMultifactorInformation) error : ", err);
                return reject(err);
            });
        });
    }

    resetRecoveryCodeForMultifactorAuthentication() {
        // API https://api.openrainbow.org/enduser/#api-multifactor_rainbow_authentication-ResetRecoveryCode 
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/mfa/recovery

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            //let userId = userId ? userId : that.account.id;
            let userId = that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/mfa/recovery";
            that._logger.log(that.INTERNAL, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resetRecoveryCodeForMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resetRecoveryCodeForMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion multifactor rainbow authentication

    //region Contacts API

    //region Contacts API - Search portal

    // phonebook
    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format: string = "small", limit: number = 100, offset?: number, sortField: string = "reverseDisplayName", sortOrder: number = 1) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_alldirectories_by_GET
        // GET /api/rainbow/search/v1.0/alldirectories

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST numberE164 : ", numberE164);

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

            that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchInAlldirectories) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchInAlldirectories) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchInAlldirectories) error : ", err);
                return reject(err);
            });
        });
    }

    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_phonebooks_by_GET
        // GET /api/rainbow/search/v1.0/phonebooks

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phonebooks";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "pbxId", pbxId);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "number", number);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchInPhonebook) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchInPhonebook) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchInPhonebook) error : ", err);
                return reject(err);
            });
        });
    }

    // users
    searchUserByPhonenumber(number: string) {
        // API https://api.openrainbow.org/search/#api-users-search_phone-numbers_users
        // GET /api/rainbow/search/v1.0/phone-numbers/:number/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phone-numbers/" + number + "/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
//            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUserByPhonenumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUserByPhonenumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUserByPhonenumber) error : ", err);
                return reject(err);
            });
        });
    }

    searchUsers(limit: number = 20, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder: number = 1) {
        // API https://api.openrainbow.org/search/#api-users-SearchUsers
        // GET /api/rainbow/search/v1.0/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST companyId : ", companyId);

            let url: string = "/api/rainbow/search/v1.0/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "excludeCompanyId", excludeCompanyId);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUsers) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API - Search portal

    //region Sources

    async createSource(userId: string, sourceId: string, os: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-createSource
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (os) {
                data.os = os;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources";
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    deleteSource(userId: string, sourceId: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-deleteSource
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    getSourceData(userId: string, sourceId: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-getSourceData
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getSourceData) args : ", data);
            that.http.get(url, that.getRequestHeader(), data).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getSourceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSourceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSourceData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSourceData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSourcesByUserId(userId: string, format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-sources-getAllSourcesByUserId
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST userId : ", userId);

            userId = userId ? userId:that.account.id;

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSourcesByUserId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSourcesByUserId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSourcesByUserId) error : ", err);
                return reject(err);
            });
        });
    }

    async updateSourceData(userId: string, sourceId: string, os: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-updateSourceData
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (os) {
                data.os = os;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateSourceData) args : ", data);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSourceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSourceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSourceData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSourceData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Sources

    //region Contacts API - Enduser portal

    async updateContactData(userId: string, sourceId: string, contactIddb: string, contactId: string = undefined, firstName: string = undefined, lastName: string = undefined, displayName: string = undefined, company: string = undefined, jobTitle: string = undefined, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) {
        // API https://api.openrainbow.org/enduser/#api-contacts-updateContact
        // PUT /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (!sourceId) {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!contactIddb) {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (contactId) {
                data.contactId = contactId;
            }

            if (firstName) {
                data.firstName = firstName;
            }

            if (lastName) {
                data.lastName = lastName;
            }

            if (displayName) {
                data.displayName = displayName;
            }

            if (company) {
                data.company = company;
            }

            if (jobTitle) {
                data.jobTitle = jobTitle;
            }

            if (phoneNumbers) {
                data.phoneNumbers = phoneNumbers;
            }

            if (emails) {
                data.emails = emails;
            }

            if (addresses) {
                data.addresses = addresses;
            }

            if (groups) {
                data.groups = groups;
            }

            if (otherData) {
                data.otherData = otherData;
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactIddb;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateContactData) args : ", data);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateContactData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateContactData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateContactData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateContactData) error : ", err);
                return reject(err);
            });
        });
    }

    async createContact(userId: string, sourceId: string, contactId: string, firstName: string, lastName: string, displayName: string, company: string, jobTitle: string, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) {
        // API https://api.openrainbow.org/enduser/#api-contacts-createContact
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (contactId) {
                data.contactId = contactId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (firstName) {
                data.firstName = firstName;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (lastName) {
                data.lastName = lastName;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (displayName) {
                data.displayName = displayName;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (company) {
                data.company = company;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (jobTitle) {
                data.jobTitle = jobTitle;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (phoneNumbers) {
                data.phoneNumbers = phoneNumbers;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (emails) {
                data.emails = emails;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (addresses) {
                data.addresses = addresses;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (groups) {
                data.groups = groups;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (otherData) {
                data.otherData = otherData;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts";
            that._logger.log(that.INTERNAL, LOG_ID + "(createContact) args : ", data);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createContact) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createContact) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createContact) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createContact) error : ", err);
                return reject(err);
            });
        });
    }

    async getContactData(userId: string, sourceId: string, contactId: string) {
        // API https://api.openrainbow.org/enduser/#api-contacts-getContact
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST userId : ", userId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getContactData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactData) error : ", err);
                return reject(err);
            });
        });
    }

    async getContactsList(userId: string, sourceId: string, format: string = "small") {
        // API https://api.openrainbow.org/enduser/#api-contacts-getContacts
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST userId : ", userId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactsList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactsList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactsList) error : ", err);
                return reject(err);
            });
        });
    }

    deleteContact(userId: string, sourceId: string, contactId: string) {
        // API https://api.openrainbow.org/enduser/#api-contacts_deleteContact-DeleteApiRainbowEnduserV10UsersUseridSourcesSourceidContactsContactid
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId ? userId:that.account.id;

            if (!sourceId) {
                that._logger.log(that.ERROR, LOG_ID + "(deleteContact) bad or empty 'sourceId' parameter");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            if (!contactId) {
                that._logger.log(that.ERROR, LOG_ID + "(deleteContact) bad or empty 'contactId' parameter");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactId;
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API - Enduser portal

    async getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId?: string, searchEmail?: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) that.account.roles : ", that.account.roles);
            if (!companyId) {
                companyId = that.account.companyId;
            }
            let url = "/api/rainbow/admin/v1.0/users?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            if (searchEmail) {
                url += "&searchEmail=" + encodeURIComponent(searchEmail);
            }
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUsers) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) after sending the request");
        });
    }

    //async getAllUsersByFilter(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId? : string, searchEmail? : string) {
    async getAllUsersByFilter(phoneNumbers: number, phoneNumber: number = undefined, searchEmail: string, companyId: string, roles: string = "user", excludeRoles: string, tags: string, departments: string, isTerminated: string = "false", isActivated: string, fileSharingCustomisation: string, userTitleNameCustomisation: string, softphoneOnlyCustomisation: string,
                              useRoomCustomisation: string, phoneMeetingCustomisation: string,
                              useChannelCustomisation: string, useScreenSharingCustomisation: string, useWebRTCVideoCustomisation: string, useWebRTCAudioCustomisation: string, instantMessagesCustomisation: string, userProfileCustomisation: string, fileStorageCustomisation: string,
                              overridePresenceCustomisation: string, alert: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, recordingConversationCustomisation: string,
                              useGifCustomisation: string, useDialOutCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string,
                              selectedAppCustomisationTemplate: string, format: string, limit: string,
                              offset: string, sortField: string, sortOrder: string, displayName: string, useEmails: boolean, companyName: string, loginEmail: string, email: string, visibility: string, organisationId: string, siteId: string, jid_im: string, jid_tel: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) that.account.roles : ", that.account.roles);
            let url = "/api/rainbow/admin/v1.0/users"; // ?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*if (!companyId) {
                companyId = that.account.companyId;
            } // */

            addParamToUrl(urlParamsTab, "phoneNumbers", phoneNumbers);
            addParamToUrl(urlParamsTab, "phoneNumber", phoneNumber);
            addParamToUrl(urlParamsTab, "searchEmail", searchEmail);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "roles", roles);
            addParamToUrl(urlParamsTab, "excludeRoles", excludeRoles);
            addParamToUrl(urlParamsTab, "tags", tags);
            addParamToUrl(urlParamsTab, "departments", departments);
            addParamToUrl(urlParamsTab, "isTerminated", isTerminated);
            addParamToUrl(urlParamsTab, "isActivated", isActivated);
            addParamToUrl(urlParamsTab, "fileSharingCustomisation", fileSharingCustomisation);
            addParamToUrl(urlParamsTab, "userTitleNameCustomisation", userTitleNameCustomisation);
            addParamToUrl(urlParamsTab, "softphoneOnlyCustomisation", softphoneOnlyCustomisation);
            addParamToUrl(urlParamsTab, "useRoomCustomisation", useRoomCustomisation);
            addParamToUrl(urlParamsTab, "phoneMeetingCustomisation", phoneMeetingCustomisation);
            addParamToUrl(urlParamsTab, "useChannelCustomisation", useChannelCustomisation);
            addParamToUrl(urlParamsTab, "useScreenSharingCustomisation", useScreenSharingCustomisation);
            addParamToUrl(urlParamsTab, "useWebRTCVideoCustomisation", useWebRTCVideoCustomisation);
            addParamToUrl(urlParamsTab, "useWebRTCAudioCustomisation", useWebRTCAudioCustomisation);
            addParamToUrl(urlParamsTab, "instantMessagesCustomisation", instantMessagesCustomisation);
            addParamToUrl(urlParamsTab, "userProfileCustomisation", userProfileCustomisation);
            addParamToUrl(urlParamsTab, "fileStorageCustomisation", fileStorageCustomisation);
            addParamToUrl(urlParamsTab, "overridePresenceCustomisation", overridePresenceCustomisation);
            addParamToUrl(urlParamsTab, "alert", alert);
            addParamToUrl(urlParamsTab, "changeTelephonyCustomisation", changeTelephonyCustomisation);
            addParamToUrl(urlParamsTab, "changeSettingsCustomisation", changeSettingsCustomisation);
            addParamToUrl(urlParamsTab, "recordingConversationCustomisation", recordingConversationCustomisation);
            addParamToUrl(urlParamsTab, "useGifCustomisation", useGifCustomisation);
            addParamToUrl(urlParamsTab, "useDialOutCustomisation", useDialOutCustomisation);
            addParamToUrl(urlParamsTab, "fileCopyCustomisation", fileCopyCustomisation);
            addParamToUrl(urlParamsTab, "fileTransferCustomisation", fileTransferCustomisation);
            addParamToUrl(urlParamsTab, "forbidFileOwnerChangeCustomisation", forbidFileOwnerChangeCustomisation);
            addParamToUrl(urlParamsTab, "readReceiptsCustomisation", readReceiptsCustomisation);
            addParamToUrl(urlParamsTab, "useSpeakingTimeStatistics", useSpeakingTimeStatistics);
            addParamToUrl(urlParamsTab, "selectedAppCustomisationTemplate", selectedAppCustomisationTemplate);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "useEmails", useEmails);
            addParamToUrl(urlParamsTab, "companyName", companyName);
            addParamToUrl(urlParamsTab, "loginEmail", loginEmail);
            addParamToUrl(urlParamsTab, "email", email);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "siteId", siteId);
            addParamToUrl(urlParamsTab, "jid_im", jid_im);
            addParamToUrl(urlParamsTab, "jid_tel", jid_tel);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsersByFilter) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsersByFilter) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUsersByFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUsersByFilter) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) after sending the request");
        });
    }

    async getContactInfos(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    async putContactInfos(userId, infos) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), infos, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    async getContacts() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContacts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContacts) REST result : " + json.total + " contacts");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContacts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContacts) error : ", err);
                return reject(err);
            });
        });
    }

    async removeContactFromRoster(dbId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!dbId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) No dbId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/networks/" + dbId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeContactFromRoster) REST result : " + json.total + " contacts");
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeContactFromRoster) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeContactFromRoster) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getContactInformationByJID(jid) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!jid) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID)  failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID) No jid provided");
                resolve(null);
            } else {

                // Remove resource from jid
                let jidBare = jid;
                if (jid.includes("/")) {
                    jidBare = jid.substr(0, jid.lastIndexOf("/"));
                }

                //that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + encodeURIComponent(jidBare), that.getRequestHeader(), undefined).then(function (json) {
                that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + jidBare, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByJID) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByJID) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByJID) error : ", err);
                    if (err && err.code===404) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + encodeURIComponent(id) + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByID) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByID) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByID) error : ", err);
                    if (err && err.code===404) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(getMyInformations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMyInformations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMyInformations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMyInformations) error : ", err);
                if (err && err.code===404) {
                    resolve(null);
                } else {
                    return reject(err);
                }
            });
        });
    }

    async getContactInformationByLoginEmail(email, sortOrder: number = 1, limit: number = 100, offset: number = 0): Promise<[any]> {
        // API https://api.openrainbow.org/enduser/#api-users-getUsersByloginEmails
        // POST "/api/rainbow/enduser/v1.0/users/loginEmails" 

        let that = this;
        return new Promise(async function (resolve, reject) {
            if (!email) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) No email provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/enduser/v1.0/users/loginEmails";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                /*if (!companyId) {
                    companyId = that.account.companyId;
                } // */

                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                addParamToUrl(urlParamsTab, "limit", limit);
                addParamToUrl(urlParamsTab, "offset", offset);
                url = urlParamsTab[0];

                let filter: any = {};
                addPropertyToObj(filter, "loginEmail", email, false);

                //that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
                await that.http.post(url, that.getRequestHeader(), filter, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByLoginEmail) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByLoginEmail) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByLoginEmail) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getContactByToken(token: string) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactByToken) with token : ", token, " : ", that.getLoginHeader());
            let decodedtoken :any = jwtDecode(token);
            let JSON = {
                "loggedInUser": decodedtoken.user,
                "loggedInApplication": decodedtoken.app,
                "token": token
            };
            if (!that._token || (that._token && that._token!=JSON.token)) {
                that.tokenRest = JSON.token;
            }
            if (!that.app || (that.app && that.app.id!=JSON.loggedInApplication.id)) {
                that.app = JSON.loggedInApplication;
            }
            if (!that.account || (that.account && that.account.id!=JSON.loggedInUser.id)) {
                that.account = JSON.loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid:that.account.jid_im;
                that.decodedtokenRest = decodedtoken;

                //let loggedInUser = await that.getContactInformationByLoginEmail(decodedtoken.user.loginEmail).then(async (contactsFromServeur: [any]) => {
                let loggedInUser = await that.getContactInformationByID(decodedtoken.user.id).then(async (contactsFromServeur: any) => {
                    if (contactsFromServeur) {
                        let contact: Contact = null;
                        that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) contact found on server, get full infos.");
                        let _contactFromServer = contactsFromServeur;
                        if (_contactFromServer) {
                            // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                            return await that.getContactInformationByID(_contactFromServer.id).then((_contactInformation: any) => {
                                that._logger.log(that.INTERNAL, LOG_ID + "(getContactByToken) contact full infos : ", _contactInformation);
                                return _contactInformation;
                            });
                        }
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) getContactInformationByID no contacts found : ", contactsFromServeur);
                        return Promise.reject(contactsFromServeur);
                    }
                }).catch((errr) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) getContactInformationByLoginEmail Error !!! error : ", errr);
                    return Promise.reject(errr);
                });
                that.account = JSON.loggedInUser = loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid:that.account.jid_im;
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) token else of if (!that.account || (that.account && that.account.id != JSON.loggedInUser.id)) " + that.account.id + "!");
            }
            that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) token signin, welcome " + that.account.id + "!");
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactByToken) user information ", that.account);
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactByToken) application information : ", that.app);
            that.getApiConfigurationFromServer();
            return Promise.resolve(JSON);
        } catch (err) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactByToken) CATCH Error !!! error : ", err);
            return Promise.reject(err);
        }
    }

    /*
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
                that._logger.log(that.DEBUG, LOG_ID + "(createUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createUser) error : ", err);
                return reject(err);
            });
        });
    }
    // */

    //createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles) {
    createUser(sendInvitationEmail: boolean = false, doNotAssignPaidLicense: boolean = false, mandatoryDefaultSubscription: boolean = false, companyId: string = undefined, loginEmail: string = undefined, customData: any = undefined, password: string = undefined, firstName: string = undefined, lastName: string = undefined,
               nickName: string = undefined, title: string = undefined, jobTitle: string = undefined, department: string = undefined, tags: Array<string> = undefined, emails: Array<any> = undefined, phoneNumbers: Array<any> = undefined, country: string = undefined, state: string = undefined, language: string = undefined,
               timezone: string = undefined, accountType: string = "free", roles: Array<string> = ["user"], adminType: string = undefined, isActive: boolean = true, isInitialized: boolean = false, visibility: string = undefined, timeToLive: number = -1, authenticationType: string = undefined,
               authenticationExternalUid: string = undefined, userInfo1: string = undefined, selectedTheme: string = undefined, userInfo2: string = undefined, isAdmin: boolean = false) {
        // POST /api/rainbow/admin/v1.0/users
        // API https://api.openrainbow.org/admin/#api-users-PostUsers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/users"
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*if (!companyId) {
                companyId = that.account.companyId;
            } // */

            addParamToUrl(urlParamsTab, "sendInvitationEmail", sendInvitationEmail);
            addParamToUrl(urlParamsTab, "doNotAssignPaidLicense", doNotAssignPaidLicense);
            addParamToUrl(urlParamsTab, "mandatoryDefaultSubscription", mandatoryDefaultSubscription);
            url = urlParamsTab[0];

            let user: any = {};
            addPropertyToObj(user, "companyId", companyId, false);
            addPropertyToObj(user, "loginEmail", loginEmail, false);
            addPropertyToObj(user, "customData", customData, false);
            addPropertyToObj(user, "password", password, false);
            addPropertyToObj(user, "firstName", firstName, false);
            addPropertyToObj(user, "lastName", lastName, false);
            addPropertyToObj(user, "nickName", nickName, false);
            addPropertyToObj(user, "title", title, false);
            addPropertyToObj(user, "jobTitle", jobTitle, false);
            addPropertyToObj(user, "department", department, false);
            addPropertyToObj(user, "tags", tags, false);
            addPropertyToObj(user, "emails", emails, false);
            addPropertyToObj(user, "phoneNumbers", phoneNumbers, false);
            addPropertyToObj(user, "country", country, false);
            addPropertyToObj(user, "state", state, false);
            addPropertyToObj(user, "language", language, false);
            addPropertyToObj(user, "timezone", timezone, false);
            addPropertyToObj(user, "accountType", accountType, false);
            addPropertyToObj(user, "roles", roles, false);
            addPropertyToObj(user, "adminType", adminType, false);
            addPropertyToObj(user, "isActive", isActive, false);
            addPropertyToObj(user, "isInitialized", isInitialized, false);
            addPropertyToObj(user, "visibility", visibility, false);
            addPropertyToObj(user, "timeToLive", timeToLive, false);
            addPropertyToObj(user, "authenticationType", authenticationType, false);
            addPropertyToObj(user, "authenticationExternalUid", authenticationExternalUid, false);
            addPropertyToObj(user, "userInfo1", userInfo1, false);
            addPropertyToObj(user, "userInfo2", userInfo2, false);
            addPropertyToObj(user, "selectedTheme", selectedTheme, false);


            /*
                loginEmail: loginEmail,
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
            // */

            if (isAdmin) {
                if (user.roles && !user.roles.some((element) => element==="admin")) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(createUser) add \"admin\" role.");
                    user.roles.push("admin");
                }
                //user.adminType = ["company_admin"];
                user.adminType = user.adminType ? user.adminType:"company_admin";
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST url : ", url, ", user : ", user);

            that.http.post(url, that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createUser) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(createGuestUser) successfull");
                // Add generated password into the answer
                json.data.password = password;
                that._logger.log(that.INTERNAL, LOG_ID + "(createGuestUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createGuestUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createGuestUser) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(changePassword) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(changePassword) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(changePassword) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(changePassword) error : ", err);
                return reject(err);
            });
        });
    }

    updateInformation(objData, userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), objData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateInformation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteUser(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUser) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(updateEndUserInformations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateEndUserInformations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateEndUserInformations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateEndUserInformations) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API

    //region Favorites

    getServerFavorites(peerId: string = undefined) {
        // API https://api.openrainbow.org/enduser/#api-favorites-GetUserFavorites
        // GET /api/rainbow/enduser/v1.0/users/:userId/favorites
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST peerId : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "peerId", peerId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerFavorites) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerFavorites) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerFavorites) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerFavorites) error : ", err);
                return reject(err);
            });
        });
    }

    public async addServerFavorite(peerId: string, type: string, position: number) {
        // API https://api.openrainbow.org/enduser/#api-favorites-createFavorite
        // POST /api/rainbow/enduser/v1.0/users/:userId/favorites
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) No peerId provided");
                resolve(null);
            } else {
                let data = {peerId, type};

                let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "position", position);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(addServerFavorite) REST url : ", url);
                that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(addServerFavorite) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(addServerFavorite) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(addServerFavorite) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(addServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    public async checkIsPeerSettedAsFavorite(peerId: string) {
        // API https://api.openrainbow.org/enduser/#api-favorites-checkUserFavoritesPeerId
        // GET /api/rainbow/enduser/v1.0/users/:userId/favorites/peers/:peerId/check
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST peerId : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites/peers/" + peerId + "/check";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "types", types);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkIsPeerSettedAsFavorite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkIsPeerSettedAsFavorite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkIsPeerSettedAsFavorite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkIsPeerSettedAsFavorite) error : ", err);
                return reject(err);
            });
        });
    }

    public async getFavoriteById(favoriteId: string) {
        // API https://api.openrainbow.org/enduser/#api-favorites-getUserFavoritesById
        // GET /api/rainbow/enduser/v1.0/users/:userId/favorites/:favoriteId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST favoriteId : ", favoriteId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites/" + favoriteId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "types", types);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getFavoriteById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFavoriteById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFavoriteById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFavoriteById) error : ", err);
                return reject(err);
            });
        });
    }

    public async getAllUserFavoriteList(peerId: string) {
        // API https://api.openrainbow.org/enduser/#api-favorites-GetUserFavorites
        // GET /api/rainbow/enduser/v1.0/users/:userId/favorites
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST peerId  : ", peerId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "peerId ", peerId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUserFavoriteList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUserFavoriteList) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUserFavoriteList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUserFavoriteList) error : ", err);
                return reject(err);
            });
        });
    }

    moveFavoriteToPosition(favoriteId: string, position: number) {
        // API https://api.openrainbow.org/enduser/#api-favorites-updateFavorite
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {};
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites/" + favoriteId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "position ", position);
            url = urlParamsTab[0];

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(moveFavoriteToPosition) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(moveFavoriteToPosition) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(moveFavoriteToPosition) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(moveFavoriteToPosition) error : ", err);
                return reject(err);
            });
        });
    }


    public async removeServerFavorite(favoriteId: string) {
        // API https://api.openrainbow.org/enduser/#api-favorites-removeFavorites
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/favorites/:favoriteId
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!favoriteId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) No favoriteId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites/" + favoriteId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeServerFavorite) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeServerFavorite) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeServerFavorite) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Favorites

    //region Invitations

    getAllSentInvitations() {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/sent?format=full&status=pending&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSentInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSentInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSentInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSentInvitations) error : ", err);
                return reject(err);
            });
        });
    };

    getInvitationsSent(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/sent";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationsSent) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInvitationsSent) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationsSent) error : ", err);
                return reject(err);
            });
        });
    };

    getAllReceivedInvitations() {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/received?format=full&status=pending&status=accepted&status=auto-accepted&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllReceivedInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllReceivedInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllReceivedInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllReceivedInvitations) error : ", err);
                return reject(err);
            });
        });
    };

    getInvitationsReceived(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/received";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationsReceived) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInvitationsReceived) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationsReceived) error : ", err);
                return reject(err);
            });
        });
    };

    getServerInvitation(invitationId) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getUserInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerInvitation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    sendInvitationByCriteria(email: string, lang: string, customMessage: string, invitedPhoneNumber: string, invitedUserId: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
        let that = this;
        return new Promise((resolve, reject) => {
            let params: any = {};
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
                that._logger.log(that.DEBUG, LOG_ID + "(sendInvitationByEmail) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendInvitationByEmail) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendInvitationByEmail) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendInvitationByEmail) error : ", err);
                return reject(err);
            });
        });
    };

    cancelOneSendInvitation(invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-cancelUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/cancel
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitation.id + "/cancel", that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(cancelOneSendInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(cancelOneSendInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(cancelOneSendInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelOneSendInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    deleteAUserInvitation(invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-deleteUserInvitation
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitation.id, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAUserInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAUserInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAUserInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAUserInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    reSendInvitation(invitationId: string, customMessage: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-resendUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/re-send
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};
            if (customMessage) {
                data.customMessage = customMessage;
            }
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId + "/re-send", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(reSendInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(reSendInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(reSendInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(reSendInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    sendInvitationsByBulk(listOfMails, lang: string = undefined, customMessage: string = undefined) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserBulkInvitations
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/bulk
        let that = this;
        let data: any = {
            emails: listOfMails
        };
        if (lang) {
            data.lang = lang;
        }
        if (customMessage) {
            data.customMessage = customMessage;
        }

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.userId + "/invitations/bulk", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendInvitationsByBulk) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendInvitationsByBulk) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendInvitationsByBulk) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendInvitationsByBulk) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * ACCEPT INVITATION
     */
    acceptInvitation(invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-acceptUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/accept

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/accept", that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptInvitation) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(declineInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/decline", that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineInvitation) successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * SEND INVITATION
     */
    joinContactInvitation(contact) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinContactInvitation) contact : ", contact);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations", that.getRequestHeader(), {"invitedUserId": contact.id}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinContactInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinContactInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinContactInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinContactInvitation) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(joinContacts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinContacts) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinContacts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinContacts) error : ", err);
                return reject(err);
            });
        });
    }

    getInvitationById(invitationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!invitationId) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationById) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationById) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getInvitationById) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationById) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getInvitationById) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationById) error : ", err);
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
                    groups = groups.concat(json?.data);
                    that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) retrieved " + json.data.length + " groups, total " + groups.length + ", existing " + json.total);
                    resolve({groups: groups, finished: groups.length===json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllGroups = function (page, limit, groups) {

            return new Promise((resolve, reject) => {

                getSetOfGroups(page, limit, groups).then((json: any) => {
                    if (json.finished) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getGroups) getSetOfGroups no need to loop again. All groups retrieve...");
                        return resolve(json.groups);
                    }
                    page += limit;
                    that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) getSetOfGroups need another loop to get more groups... [" + json.groups.length + "]");
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
                that._logger.log(that.DEBUG, LOG_ID + "(getGroups) getAllGroups successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) getAllGroups received " + json.length + " groups");
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getGroups) getAllGroups error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroups) getAllGroups error : ", err);
                return reject(err);
            });
        });
    }

    getGroup(groupId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupFavorite(groupId: string, favorite: boolean) {
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
        //let groupId = group.id;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupFavorite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupFavorite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupFavorite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupFavorite) error : ", err);
                return reject(err);
            });
        });
    }

    createGroup(name: string, comment: string, isFavorite: boolean) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups", that.getRequestHeader(), {
                name: name,
                comment: comment,
                isFavorite: isFavorite
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteGroup(groupId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupName(groupId: string, name: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), {
                name: name
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupName) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupName) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupComment(groupId: string, comment: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), {
                comment: comment
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupComment) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupComment) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupComment) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupComment) error : ", err);
                return reject(err);
            });
        });
    }

    addUserInGroup(contactId: string, groupId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addUserInGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addUserInGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addUserInGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addUserInGroup) error : ", err);
                return reject(err);
            });
        });
    }

    removeUserFromGroup(contactId: string, groupId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeUserFromGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeUserFromGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(removeUserFromGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(removeUserFromGroup) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Groups

    getBots() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/bots", that.getRequestHeader(), undefined, "", 5, 10000).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBots) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBots) REST result : " + json.total + " bots");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBots) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBots) error : ", err);
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
    getUserPresenceInformation(userId: string = undefined) {
        let that = this;

        if (!userId) {
            userId = that.userId;
        }

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId + "/presences", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserPresenceInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserPresenceInformation) REST result : ", json, " user presence.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getUserPresenceInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserPresenceInformation) error : ", err);
                return reject(err);
            });
        });
    }

    getMyPresenceInformation() {
        let that = this;

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/me/presences", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMyPresenceInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMyPresenceInformation) REST result : ", json, " user presence.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMyPresenceInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMyPresenceInformation) error : ", err);
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
    getMediaPillarInfo() {
        let that = this;

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/mediapillar/v1.0/mediapillars/data", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMediaPillarInfo) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMediaPillarInfo) REST result : ", json, " MediaPillar Info");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMediaPillarInfo) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMediaPillarInfo) error : ", err);
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

            that._logger.log(that.DEBUG, LOG_ID + "(createBubble) will call POST request.");

            that.http.post("/api/rainbow/enduser/v1.0/rooms", that.getRequestHeader(), {
                        name: name,
                        topic: description,
                        history: history
                    }
                    , undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubble) error : ", err);
                return reject(err);
            });
        });
    }

    updateRoomData(bubbleId: string, data: any) {
        // API https://api.openrainbow.org/enduser/#api-rooms-updateRoom
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateRoomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateRoomData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateRoomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateRoomData) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleVisibility) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleVisibility) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleVisibility) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleVisibility) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleAutoRegister(bubbleId: string, autoRegister: string = "unlock") {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {
                        autoRegister: autoRegister
                    }
                    , undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleAutoRegister) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleAutoRegister) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleAutoRegister) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleAutoRegister) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleTopic) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleTopic) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleTopic) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleTopic) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleName) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleName) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbleLastActivityDate(bubble) {
        let date: Date;
        if (bubble?.lastActivityDate) {
            date = new Date(bubble?.lastActivityDate);
        } else if (bubble?.creationDate) {
            date = new Date(bubble?.creationDate);
        } else {
            date = new Date(0);
        }
        return date.getTime();
    }

    sortByDate(dateA, dateB) {
        let res = 1;
        if (dateA && dateB) {
            res = dateB - dateA;
        }
        return res;
    }

    getBubbles(format: string = "small", unsubscribed: boolean = false) {
        let that = this;
        let getSetOfBubbles = (page, max, bubbles) => {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/rooms?format=" + format + "&unsubscribed=" + unsubscribed + "&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                    //that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, that.getRequestHeader(), undefined).then(function (json) {
                    bubbles = bubbles.concat(json?.data);
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) getSetOfBubbles successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getBubbles) REST result : getSetOfBubbles retrieved " + json.data.length + " bubbles, total " + bubbles.length + ", existing " + json.total);
                    resolve({bubbles: bubbles, finished: bubbles.length===json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllBubbles = function (page, limit, bubbles) {

            return new Promise((resolve, reject) => {
                getSetOfBubbles(page, limit, bubbles).then((json: any) => {
                    if (json.finished) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getAllBubbles) no need to loop again. All bubbles retrieved...");
                        return resolve(json.bubbles);
                    }

                    page += limit;
                    that._logger.log(that.DEBUG, LOG_ID + "(getAllBubbles) need another loop to get more bubbles... [" + json.bubbles.length + "]");
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
                that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) getAllBubbles successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbles) getAllBubbles REST result : " + json.length + " bubbles");
                //json.sort((a, b) => that.getBubbleLastActivityDate(b) - that.getBubbleLastActivityDate(a));
                // lastActivityDate
                //bubbles = orderByFilter( bubbles, that.getBubbleLastActivityDate, true, that.sortByDate);

                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getBubbles) getAllBubbles error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubbles) getAllBubbles error : ", err);
                return reject(err);
            });
        });
    }

    getBubble(bubbleId: string, context: string = undefined, format: string = "full", unsubscribed: boolean = true, nbUsersToKeep: number = 100) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomById
        // GET /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/" + bubbleId;//+ "?format=full&unsubscribed=true";
            if (bubbleId===undefined) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubble) bad request paramater bubbleId undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            if (context!=undefined) {
                url += "/" + context;
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format!=undefined) {
                addParamToUrl(urlParamsTab, "format", format);
            }
            if (unsubscribed!=undefined) {
                addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed);
            }
            if (nbUsersToKeep!=undefined) {
                addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep);
            }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubble) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbleByJid(bubbleJid: string, format: string = "full", unsubscribed: boolean = true, nbUsersToKeep: number = 100) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomByJid
        // GET /api/rainbow/enduser/v1.0/rooms/jids/:jid
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/jids/" + bubbleJid;
            if (bubbleJid===undefined) {
                that._logger.log(that.WARN, LOG_ID + "(getBubble) bad request paramater bubbleJid undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format!=undefined) {
                addParamToUrl(urlParamsTab, "format", format);
            }
            if (unsubscribed!=undefined) {
                addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed);
            }
            if (nbUsersToKeep!=undefined) {
                addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep);
            }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleByJid) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubbleByJid) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubbleByJid) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBubblesJidsOfAUserIsMemberOf(isActive ?: boolean, webinar ?: boolean, unsubscribed: boolean = true, limit: number = 100, offset: number = 0, sortField ?: string, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomJIDs
        // GET /api/rainbow/enduser/v1.0/rooms/jids
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/jids";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (isActive!=undefined) {
                addParamToUrl(urlParamsTab, "isActive", isActive);
            }
            if (webinar!=undefined) {
                addParamToUrl(urlParamsTab, "webinar", webinar);
            }
            if (unsubscribed!=undefined) {
                addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed);
            }
            if (limit!=undefined) {
                addParamToUrl(urlParamsTab, "limit", limit);
            }
            if (offset!=undefined) {
                addParamToUrl(urlParamsTab, "offset", offset);
            }
            if (sortField!=undefined) {
                addParamToUrl(urlParamsTab, "sortField", sortField);
            }
            if (sortOrder!=undefined) {
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesJidsOfAUserIsMemberOf) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesJidsOfAUserIsMemberOf) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBubblesVisibleByTheUser(format: string = "small", userId ?: string, status ?: string, confId ?: string, scheduled ?: boolean, hasConf ?: boolean, isActive ?: boolean, name ?: string, sortField ?: string, sortOrder: number = 1,
                                  unsubscribed: boolean = false, webinar ?: boolean, limit: number = 100, offset: number = 0, nbUsersToKeep: number = 100, creator ?: string, context ?: string, needIsAlertNotificationEnabled: string = "true") {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRooms
        // GET /api/rainbow/enduser/v1.0/rooms
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (userId==undefined) {
                userId = that.account.id;
            }


            if (format!=undefined) {
                addParamToUrl(urlParamsTab, "format", format);
            }
            if (userId!=undefined) {
                addParamToUrl(urlParamsTab, "userId", userId);
            }
            if (status!=undefined) {
                addParamToUrl(urlParamsTab, "status", status);
            }
            if (confId!=undefined) {
                addParamToUrl(urlParamsTab, "confId", confId);
            }
            if (scheduled!=undefined) {
                addParamToUrl(urlParamsTab, "scheduled", scheduled);
            }
            if (hasConf!=undefined) {
                addParamToUrl(urlParamsTab, "hasConf", hasConf);
            }
            if (isActive!=undefined) {
                addParamToUrl(urlParamsTab, "isActive", isActive);
            }
            if (name!=undefined) {
                addParamToUrl(urlParamsTab, "name", name);
            }
            if (sortField!=undefined) {
                addParamToUrl(urlParamsTab, "sortField", sortField);
            }
            if (sortOrder!=undefined) {
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            }
            if (unsubscribed!=undefined) {
                addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed);
            }
            if (webinar!=undefined) {
                addParamToUrl(urlParamsTab, "webinar", webinar);
            }
            if (limit!=undefined) {
                addParamToUrl(urlParamsTab, "limit", limit);
            }
            if (offset!=undefined) {
                addParamToUrl(urlParamsTab, "offset", offset);
            }
            if (nbUsersToKeep!=undefined) {
                addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep);
            }
            if (creator!=undefined) {
                addParamToUrl(urlParamsTab, "creator", creator);
            }
            if (context!=undefined) {
                addParamToUrl(urlParamsTab, "context", context);
            }
            if (needIsAlertNotificationEnabled!=undefined) {
                addParamToUrl(urlParamsTab, "needIsAlertNotificationEnabled", needIsAlertNotificationEnabled);
            }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesVisibleByTheUser) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesVisibleByTheUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesVisibleByTheUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesVisibleByTheUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesVisibleByTheUser) error : ", err);
                return reject(err);
            });
        });
    }

    getBubblesDataByListOfBubblesIds(bubblesIds: Array<string>, format: string = "small", userId ?: string, status ?: string, confId ?: string, scheduled ?: boolean, hasConf ?: boolean, sortField ?: string, sortOrder: number = 1,
                                     unsubscribed: boolean = false, webinar ?: boolean, limit: number = 100, offset: number = 0, nbUsersToKeep: number = 100, context ?: string, needIsAlertNotificationEnabled: string = "true") {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomsByIds
        // GET /api/rainbow/enduser/v1.0/rooms/ids
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/ids";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format!=undefined) {
                addParamToUrl(urlParamsTab, "format", format);
            }
            if (userId!=undefined) {
                addParamToUrl(urlParamsTab, "userId", userId);
            }
            if (status!=undefined) {
                addParamToUrl(urlParamsTab, "status", status);
            }
            if (confId!=undefined) {
                addParamToUrl(urlParamsTab, "confId", confId);
            }
            if (scheduled!=undefined) {
                addParamToUrl(urlParamsTab, "scheduled", scheduled);
            }
            if (hasConf!=undefined) {
                addParamToUrl(urlParamsTab, "hasConf", hasConf);
            }
            if (sortField!=undefined) {
                addParamToUrl(urlParamsTab, "sortField", sortField);
            }
            if (sortOrder!=undefined) {
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            }
            if (unsubscribed!=undefined) {
                addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed);
            }
            if (webinar!=undefined) {
                addParamToUrl(urlParamsTab, "webinar", webinar);
            }
            if (limit!=undefined) {
                addParamToUrl(urlParamsTab, "limit", limit);
            }
            if (offset!=undefined) {
                addParamToUrl(urlParamsTab, "offset", offset);
            }
            if (nbUsersToKeep!=undefined) {
                addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep);
            }
            if (context!=undefined) {
                addParamToUrl(urlParamsTab, "context", context);
            }
            if (needIsAlertNotificationEnabled!=undefined) {
                addParamToUrl(urlParamsTab, "needIsAlertNotificationEnabled", needIsAlertNotificationEnabled);
            }
            url = urlParamsTab[0];

            let data = {
                "roomIds": bubblesIds,
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesDataByListOfBubblesIds) REST url : ", url);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblesDataByListOfBubblesIds) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesDataByListOfBubblesIds) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblesDataByListOfBubblesIds) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblesDataByListOfBubblesIds) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleCustomData(bubbleId, customData) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/custom-data", that.getRequestHeader(), customData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleCustomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleCustomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleCustomData) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator":"user";
            let status = withInvitation ? "invited":"accepted";
            reason = reason || "from moderator";

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users", that.getRequestHeader(), {
                userId: contactId,
                reason: reason,
                privilege: privilege,
                status: status
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteContactToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteContactToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactsByEmailsToBubble(contactsEmails, bubbleId) {
        // API https://api.openrainbow.org/enduser/#api-rooms_invitation-sendUsersJoinRoomInvitation
        // POST /api/rainbow/enduser/v1.0/rooms/:roomId/invitations
        let that = this;
        const data = {
            scenario: "chat",
            emails: contactsEmails
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/invitations", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteContactsByEmailsToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactsByEmailsToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteContactsByEmailsToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteContactsByEmailsToBubble) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getRoomUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRoomUsers) REST result : ", json.total, " users in bubble");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRoomUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRoomUsers) error : ", err);
                return reject(err);
            });
        });
    }

    promoteContactInBubble(contactId, bubbleId, asModerator) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator":"user";
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {privilege: privilege}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(promoteContactInBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(promoteContactInBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(promoteContactInBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(promoteContactInBubble) error : ", err);
                return reject(err);
            });
        });
    }

    changeBubbleOwner(bubbleId, contactId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {"owner": contactId}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(changeBubbleOwner) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(changeBubbleOwner) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(changeBubbleOwner) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(changeBubbleOwner) error : ", err);
                return reject(err);
            });
        });
    }

    archiveBubble(bubbleId) {
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/archive
        // API https://api.openrainbow.org/enduser/#api-rooms-updateRoomArchive 
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(archiveBubble) bubbleId : ", bubbleId);
            let data = {};
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/archive", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(archiveBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(archiveBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(archiveBubble) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(archiveBubble) error : ", err);
                return reject(err);
            });
        });
    }

    leaveBubble(bubbleId, bubbleStatus) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) bubbleId : ", bubbleId, ", bubbleStatus : ", bubbleStatus);
            switch (bubbleStatus) {
                case "unsubscribed":
                    that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader()).then(function (json) {
                        that._logger.log(that.DEBUG, LOG_ID + "(leaveBubble) delete successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) REST result : ", json);
                        resolve(json?.data);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(leaveBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                default:
                    that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {"status": "unsubscribed"}, undefined).then(function (json) {
                        that._logger.log(that.DEBUG, LOG_ID + "(leaveBubble) unsubscribed successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) REST result : ", json);
                        resolve(json?.data);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(leaveBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
            }
        });
    }

    deleteBubble(bubbleId) {
        // API https://api.openrainbow.org/enduser/#api-rooms-deleteRoom
        // DELETE /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubble) error : ", err);
                return reject(err);
            });
        });
    }

    removeInvitationOfContactToBubble(contactId, bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeInvitationOfContactToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeInvitationOfContactToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removeInvitationOfContactToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removeInvitationOfContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    unsubscribeContactFromBubble(contactId, bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {status: "unsubscribed"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unsubscribeContactFromBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unsubscribeContactFromBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unsubscribeContactFromBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unsubscribeContactFromBubble) error : ", err);
                return reject(err);
            });
        });
    }

    acceptInvitationToJoinBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {status: "accepted"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptInvitationToJoinBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitationToJoinBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptInvitationToJoinBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    declineInvitationToJoinBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {status: "rejected"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineInvitationToJoinBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(declineInvitationToJoinBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineInvitationToJoinBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteUserFromBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteUserFromBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserFromBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteUserFromBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUserFromBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteUser(email, _companyId, language, message) {
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

            let companyId = _companyId ? _companyId:that.account.companyId;

            that.http.post("/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/invitations", that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteUser) error : ", err);
                return reject(err);
            });
        });
    }

    setAvatarRoom(bubbleid, binaryData) {
        let that = this;

        return new Promise(function (resolve, reject) {
            let data = binaryData.data;
            //let bufferArray = new Array(data.length);
            //bufferArray[0] = data;
            //let buffer = Buffer.concat(bufferArray);

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleid + "/avatar", that.getRequestHeader("application/json"),  Buffer.from(data), "image/" + binaryData.type).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setAvatarRoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setAvatarRoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setAvatarRoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAvatarRoom(roomId) {
        return new Promise((resolve, reject) => {
            let that = this;

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/avatar", that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAvatarRoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAvatarRoom) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAvatarRoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    };

    getBubblesConsumption() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/rooms/consumption", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblesConsumption) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesConsumption) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblesConsumption) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblesConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    //region CONTAINERS (Bubble Folder)

    // Get all rooms containers
    getAllBubblesContainers(name: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {

            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (name) {
                url += "?name=" + name;
            }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesContainers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesContainers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesContainers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesContainers) error : ", err);
                return reject(err);
            });
        });
    }

    // Get one rooms container
    getABubblesContainersById(id: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {

            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (id) {
                url += "/" + id;
            }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblesContainersById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABubblesContainersById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABubblesContainersById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABubblesContainersById) error : ", err);
                return reject(err);
            });
        });
    }

    // Add some rooms to the container
    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                "rooms": bubbleIds
            };

            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/add", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addBubblesToContainersById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubblesToContainersById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addBubblesToContainersById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addBubblesToContainersById) error : ", err);
                return reject(err);
            });
        });
    }

    // Change one rooms container name or description
    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
                "name": name
            };

            if (description) {
                data.description = description;
            }

            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubbleContainersNameAndDescriptionById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateBubbleContainersNameAndDescriptionById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error : ", err);
                return reject(err);
            });
        });
    }

    // Create a rooms container
    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(createBubbleContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubbleContainer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubbleContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    }

    // Delete one rooms container
    deleteBubbleContainer(containerId) {
        return new Promise((resolve, reject) => {
            let that = this;

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubbleContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubbleContainer) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteBubbleContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    };

    // Remove some rooms from the container
    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                "rooms": bubbleIds
            };

            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/remove", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeBubblesFromContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubblesFromContainer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removeBubblesFromContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removeBubblesFromContainer) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(ownerUpdateRoomCustomData) roomData : ", roomData);
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomData.id + "/custom-data", that.getRequestHeader("application/json"), data, undefined).then(function(json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ownerUpdateRoomCustomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ownerUpdateRoomCustomData) REST bubble Avatar sent : ", json);
                resolve(json.data.customData || {});
            }).catch(function(err) {
                that._logger.log(that.ERROR, LOG_ID, "(ownerUpdateRoomCustomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ownerUpdateRoomCustomData) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(ownerUpdateRoomCustomData) roomData : ", roomData);
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomData.id , that.getRequestHeader("application/json"), data, undefined).then(function(json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ownerUpdateRoomCustomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ownerUpdateRoomCustomData) REST bubble Avatar sent : ", json);
                resolve(json.data || {});
            }).catch(function(err) {
                that._logger.log(that.ERROR, LOG_ID, "(ownerUpdateRoomCustomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ownerUpdateRoomCustomData) error : ", err);
                return reject(err);
            });
        });
    };
    // */

    //region FileStorage

    createFileDescriptor(name, extension, size, viewers, voicemessage: boolean, duration: number, encoding: boolean, ccarelogs: boolean, ccareclientlogs: boolean) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(createFileDescriptor) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(createFileDescriptor) REST get Blob from Url");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileDescriptor(fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFileDescriptor) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFileDescriptor) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFileDescriptors(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number = 1000, offset: number, sortField: string, sortOrder: number, format: string = "full") {
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
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST fileName : ", fileName);

            let url: string = "/api/rainbow/filestorage/v1.0/files";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (fileName!=undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName);
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
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFileDescriptors) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFileDescriptors) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFileDescriptors) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveFileDescriptors) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveFileDescriptors) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveFilesReceivedFromPeer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveFilesReceivedFromPeer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveFilesReceivedFromPeer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveFilesReceivedFromPeer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string = "full", limit: number = 100, offset: number, sortField: string, sortOrder: number) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_getAllViewerId
        // URL GET /api/rainbow/filestorage/v1.0/files/viewers/:viewerId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST fileName : ", fileName);

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
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST url : ", url);

            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + viewerId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveOneFileDescriptor) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveOneFileDescriptor) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveOneFileDescriptor) REST result : ", json);
                let res = json ? json?.data:{};
                resolve(res);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveOneFileDescriptor) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveOneFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserConsumption() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/users/consumption", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserConsumption) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserConsumption) REST get file descriptors");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserConsumption) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveUserConsumption) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveUserConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileViewer(viewerId, fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId + "/viewers/" + viewerId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFileViewer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFileViewer) RREST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFileViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFileViewer) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(addFileViewer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addFileViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addFileViewer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addFileViewer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileDescriptorsByCompanyId(companyId, fileName: boolean, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "fileName", sortOrder: number = 1) {
        // URL : GET /api/rainbow/filestorage/v1.0/companies/:companyId/files
        // API : https://api.openrainbow.org/filestorage/#api-files-files_getAllByCompanyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST companyId : ", companyId);

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
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFileDescriptorsByCompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFileDescriptorsByCompanyId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFileDescriptorsByCompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFileDescriptorsByCompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    copyFileInPersonalCloudSpace(fileId: string) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_copyOne
        // URL POST /api/rainbow/filestorage/v1.0/files/:fileId/copy
        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/filestorage/v1.0/files/" + fileId + "/copy", that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(copyFileInPersonalCloudSpace) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(copyFileInPersonalCloudSpace) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(copyFileInPersonalCloudSpace) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(copyFileInPersonalCloudSpace) error : ", err);
                return reject(err);
            });
        });
    }

    fileOwnershipChange(fileId: string, userId: string) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_dropOne
        // URL PUT /api/rainbow/filestorage/v1.0/files/:fileId/drop
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                userId
            };

            that.http.put("/api/rainbow/filestorage/v1.0/files/" + fileId + "/drop", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(fileOwnershipChange) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(fileOwnershipChange) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(fileOwnershipChange) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(fileOwnershipChange) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) REST get Blob from Url");
                resolve({"data": data, "index": index});
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPartialDataFromServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPartialDataFromServer) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getPartialDataFromServer) REST get Blob from Url");
                resolve({"data": data, "index": index});
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPartialDataFromServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPartialDataFromServer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileFromUrl(url) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader("application/octet-stream"), undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(getFileFromUrl) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getFileFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFileFromUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFileFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    getBlobFromUrl(url) {
        let that = this;
        return new Promise(function (resolve, reject) {
            /* responseType: 'arraybuffer'// */
            that.http.get(url, that.getRequestHeader("responseType: 'arraybuffer'"), undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBlobFromUrl) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getBlobFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBlobFromUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBlobFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    uploadAFile(fileId, buffer) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/fileserver/v1.0/files/" + fileId, that.getRequestHeader("Content-Type: 'application/octet-stream'"), buffer, undefined).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadAFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadAFile) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadAFile) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadAFile) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(uploadAStream) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadAStream) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadAStream) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadAStream) error : ", err);
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

            that._logger.log(that.DEBUG, LOG_ID + " sendPartialDataToServer, fileId : " + fileId + ", index : " + index + " Headers : ", JSON.stringify(headers, null, "  "));

            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId + "/parts/" + index, headers, file).then(function (response) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendPartialDataToServer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendPartialDataToServer) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendPartialDataToServer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendPartialDataToServer) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(sendPartialFileCompletion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendPartialFileCompletion) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendPartialFileCompletion) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendPartialFileCompletion) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserSettings) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    updateUserSettings(settings) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", that.getRequestHeader(), settings, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateUserSettings) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Settings

    getServerCapabilities() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/fileserver/v1.0/capabilities", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerCapabilities) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerCapabilities) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getServerCapabilities) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerCapabilities) error : ", err);
                return reject(err);
            });
        });
    }

    //region Company

    //region Company Management

    getAllCompanies(format: string = "small", sortField: string = "name", bpId: string = undefined, catalogId: string = undefined, offerId: string = undefined, offerCanBeSold: boolean = undefined, externalReference: string = undefined, externalReference2: string = undefined, salesforceAccountId: string = undefined, selectedAppCustomisationTemplate: string = undefined, selectedThemeObj: boolean = undefined, offerGroupName: string = undefined, limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, status: string = undefined, visibility: string = undefined, organisationId: string = undefined, isBP: boolean = undefined, hasBP: boolean = undefined, bpType: string = undefined) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompanies
        // URL get /api/rainbow/admin/v1.0/companies

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) that.account.roles : ", that.account.roles);

            let url: string = "/api/rainbow/admin/v1.0/companies";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompanies) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompanies) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCompanies) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCompanies) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) after sending the request");
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
                that._logger.log(that.DEBUG, LOG_ID + "(createCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCompany) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCompany) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompany) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCompany(companyId) {
        // API https://api.openrainbow.org/admin/#api-companies-DeleteCompanies
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteCompany) companyId", companyId);
            that.http.delete('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCompany) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyInfos(companyId, format: string = "full", selectedThemeObj: boolean = false, name: string, status: string, visibility: string, organisationId: string, isBP: boolean, hasBP: boolean, bpType: string) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanyById
        // URL get /api/rainbow/enduser/v1.0/companies/:companyId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies/' + companyId;
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyInfos) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyInfos) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyInfos) error : ", err);
                return reject(err);
            });
        });
    }

    getCompaniesBPBusinessType () {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesBpBusinessType
        // URL get /api/rainbow/admin/v1.0/companies/bpbusinesstypes
        let that = this;

        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/bpbusinesstypes";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompaniesBPBusinessType) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompaniesBPBusinessType) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompaniesBPBusinessType) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompaniesBPBusinessType) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompaniesBPBusinessType) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyAppFeatureCustomisation(_companyId : string) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompanyAppFeatureCustomisation
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation
        let that = this;

        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAppFeatureCustomisation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyAppFeatureCustomisation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAppFeatureCustomisation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyAppFeatureCustomisation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyAppFeatureCustomisation) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyServiceDescriptionFile(_companyId : string) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesServiceDescription
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/service-description
        let that = this;

        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyServiceDescriptionFile) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyServiceDescriptionFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyServiceDescriptionFile) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyServiceDescriptionFile) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyServiceDescriptionFile) error : ", err);
                return reject(err);
            });
        });
    }

    getDefaultCompanyData(format : string, selectedThemeObj : boolean) {
        // API https://api.openrainbow.org/admin/#api-companies-GetDefaultCompany
        // URL get /api/rainbow/admin/v1.0/companies/default
        let that = this;

        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/default";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getDefaultCompanyData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getDefaultCompanyData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDefaultCompanyData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDefaultCompanyData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDefaultCompanyData) error : ", err);
                return reject(err);
            });
        });
    }

    setCompanyAppFeatureCustomisation (_companyId : string, appFeaturesCustomisation : any) {
        // API https://api.openrainbow.org/admin/#api-companies-SetCompanyFeatureCustomisation
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation

        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let data: any = appFeaturesCustomisation;
            //addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCompanyAppFeatureCustomisation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCompanyAppFeatureCustomisation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error : ", err);
                return reject(err);
            });
        });
    }



    /**
     * Parameters for updating company details.
     * @param _companyId
     * @param selectedThemeObj Allows to return selectedTheme attribute as an object:
     * - true returns selectedTheme as an object (e.g. { "light": "60104754c8fada2ad4be3e48", "dark": "5ea304e4359c0e6815fc8b57" }),
     * - false return selectedTheme as a string.
     *
     * The list of allowed countries can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries)
     *
     * The `country` value which is provided at company creation is used to determine the location (data-center)
     * where all the data related to this company will be stored. The data-center closest to the company's `country` is
     * used.
     *
     * ⚠ Warning: the location of the company's data can't be changed after the company creation. The `country` value
     * can be updated, but the data will remain in the data-center selected during the company creation.
     *
     * Once the company is created, the location where the data are stored is indicated in the field `dataLocation`
     * returned by the API [GET /api/rainbow/admin/v1.0/companies/:companyId](#api-companies-GetCompaniesId).
     *
     * If no `country` is provided, the default value is `"FRA"`, meaning that the company data are stored in French
     * data-center.
     *
     * The list of allowed states can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries) for the associated countries.
     *
     * - List of allowed states for `USA`:
     *   - `AA`: "Armed Forces America",
     *   - `AE`: "Armed Forces",
     *   - `AP`: "Armed Forces Pacific",
     *   - `AK`: "Alaska",
     *   - `AL`: "Alabama",
     *   - `AR`: "Arkansas",
     *   - `AZ`: "Arizona",
     *   - `CA`: "California",
     *   - `CO`: "Colorado",
     *   - `CT`: "Connecticut",
     *   - `DC`: Washington DC",
     *   - `DE`: "Delaware",
     *   - `FL`: "Florida",
     *   - `GA`: "Georgia",
     *   - `GU`: "Guam",
     *   - `HI`: "Hawaii",
     *   - `IA`: "Iowa",
     *   - `ID`: "Idaho",
     *   - `IL`: "Illinois",
     *   - `IN`: "Indiana",
     *   - `KS`: "Kansas",
     *   - `KY`: "Kentucky",
     *   - `LA`: "Louisiana",
     *   - `MA`: "Massachusetts",
     *   - `MD`: "Maryland",
     *   - `ME`: "Maine",
     *   - `MI`: "Michigan",
     *   - `MN`: "Minnesota",
     *   - `MO`: "Missouri",
     *   - `MS`: "Mississippi",
     *   - `MT`: "Montana",
     *   - `NC`: "North Carolina",
     *   - `ND`: "North Dakota",
     *   - `NE`: "Nebraska",
     *   - `NH`: "New Hampshire",
     *   - `NJ`: "New Jersey",
     *   - `NM`: "New Mexico",
     *   - `NV`: "Nevada",
     *   - `NY`: "New York",
     *   - `OH`: "Ohio",
     *   - `OK`: "Oklahoma",
     *   - `OR`: "Oregon",
     *   - `PA`: "Pennsylvania",
     *   - `PR`: "Puerto Rico",
     *   - `RI`: "Rhode Island",
     *   - `SC`: "South Carolina",
     *   - `SD`: "South Dakota",
     *   - `TN`: "Tennessee",
     *   - `TX`: "Texas",
     *   - `UT`: "Utah",
     *   - `VA`: "Virginia",
     *   - `VI`: "Virgin Islands",
     *   - `VT`: "Vermont",
     *   - `WA`: "Washington",
     *   - `WI`: "Wisconsin",
     *   - `WV`: "West Virginia",
     *   - `WY`: "Wyoming"
     * - List of allowed states for `CAN`:
     *   - `AB`: "Alberta",
     *   - `BC`: "British Columbia",
     *   - `MB`: "Manitoba",
     *   - `NB`: "New Brunswick",
     *   - `NL`: "Newfoundland and Labrador",
     *   - `NS`: "Nova Scotia",
     *   - `NT`: "Northwest Territories",
     *   - `NU`: "Nunavut",
     *   - `ON`: "Ontario",
     *   - `PE`: "Prince Edward Island",
     *   - `QC`: "Quebec",
     *   - `SK`: "Saskatchewan",
     *   - `YT`: "Yukon"
     * <br/> For now, only USD, EUR and CNY are supported
     * <br/> Only settable by `superadmin`
     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users
     * - `private`: User **can't** be searched by external users (even within his organisation) / can search external users. User can invite external users / can be invited by external users
     * - `organization`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users
     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users
     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users
     * - `hotspot`: User can be searched by hotspot attached company's users (users from any company if the user belong to the default company) / can't search any users (even in their company) | user can't invite external users / can be invited by hotspot attached company's users (users from any company if the user belong to the default company)
     *   - currently `hotspot` visibility can only be set on the default company, and with superadmin role (development of `hotspot` visibility is partially done, only for default company in the context of RQRAINB-7456)
     *
     * External users mean public user not being in user's company nor user's organisation nor a company visible by user's company.
     *
     * Note related to organisation visibility:
     * - Under the same organisation, a company can choose the visibility=organisation. That means users belonging to this company are visible for users of foreign companies inside the same organisation.
     * - The visibility=organisation is same as visibility=private outside the organisation. That is to say users can't be searched outside the organisation's companies.
     * <br/> adminEmail is case sentive.
     * - supportEmail is case sensitive.
     * - supportEmail `should be provided if company to create is a VAD or a DR`
     * <br/> Note that if `disableCCareAdminAccessCustomers` is enabled on its BP company or `disableCCareAdminAccessResellers` is enabled on its BP VAD company, this setting is forced to true.
     * <br/> `disableCCareAdminAccess` can only be set:
     *   - by `superadmin` (all companies),
     *   - by `bp_admin` or `bp_finance` for the companies he manages,
     *   - by `organization_admin` for the BP companies he manages.
     *   - by `organization_admin` for the companies he manages.
     * <br/> This setting is only applicable for BP companies (`isBP`=true)
     *  - If the BP company is a DR or an IR, enabling this setting disables the access to the customer care logs for the admins of all its customers companies.
     *  - If the BP company is a VAD, enabling this setting disables the access to the customer care logs for all the admins of its customers companies.\
     *    Note that the bp_admins/admins of all the BP IRs companies linked to this VAD still have access to the customer care logs (the setting `disableCCareAdminAccessResellers` on the BP VAD company allows to disable it).
     * <br/> `disableCCareAdminAccessCustomers` can only be set:
     *   - by `superadmin` (all BP companies),
     *   - by `bp_admin` or `bp_finance` of a BP VAD company for the BP companies he manages,
     *   - by `organization_admin` for the BP companies he manages,
     *   - by `company_admin` for the BP company he manages.
     * <br/> This setting is only applicable for BP VAD companies (`isBP`=true and `bpType`=`VAD`)
     * <br/> Enabling this setting disables on the BP VAD company disables the access to the customer care logs for the bp_admins/admins of all the BP IRs linked to this VAD, and to all the admins of their customers.
     * <br/> Note that the admins of all the customer companies directly linked to this VAD still have access to the customer care logs (the setting `disableCCareAdminAccessCustomers` on the BP VAD company allows to disable it).
     * <br/> `disableCCareAdminAccessResellers` can only be set:
     *   - by `superadmin` (all BP VAD companies),
     *   - by `bp_admin` or `bp_finance` of a BP VAD company for the BP companies he manages,
     *   - by `organization_admin` for the BP VAD companies he manages,
     *   - by `company_admin` for the BP VAD company he manages.
     * An overview of the number of employees
     * - `A`: AGRICULTURE, FORESTRY AND FISHING
     * - `B`: MINING AND QUARRYING
     * - `C`: MANUFACTURING
     * - `D`: ELECTRICITY, GAS, STEAM AND AIR CONDITIONING SUPPLY
     * - `E`: WATER SUPPLY; SEWERAGE, WASTE MANAGEMENT AND REMEDIATION ACTIVITIES
     * - `F`: CONSTRUCTION
     * - `G`: WHOLESALE AND RETAIL TRADE; REPAIR OF MOTOR VEHICLES AND MOTORCYCLES
     * - `H`: TRANSPORTATION AND STORAGE
     * - `I`: ACCOMMODATION AND FOOD SERVICE ACTIVITIES
     * - `J`: INFORMATION AND COMMUNICATION
     * - `K`: FINANCIAL AND INSURANCE ACTIVITIES
     * - `L`: REAL ESTATE ACTIVITIES
     * - `M`: PROFESSIONAL, SCIENTIFIC AND TECHNICAL ACTIVITIES
     * - `N`: ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES
     * - `O`: PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY
     * - `P`: EDUCATION
     * - `Q`: HUMAN HEALTH AND SOCIAL WORK ACTIVITIES
     * - `R`: ARTS, ENTERTAINMENT AND RECREATION
     * - `S`: OTHER SERVICE ACTIVITIES
     * - `T`: ACTIVITIES OF HOUSEHOLDS AS EMPLOYERS; UNDIFFERENTIATED GOODS- AND SERVICES-PRODUCING ACTIVITIES OF HOUSEHOLDS FOR OWN USE
     * - `U`: ACTIVITIES OF EXTRATERRITORIAL ORGANISATIONS AND BODIES
     * `This field is deprecated.` Manage instead <b>useGifCustomisation field!</b>
     * <br/> When a new company is created, if no catalogId is specified the company is automatically linked to the default catalog.
     * <br/> When a `bp_admin>` or `bp_finance>` creates a company, catalogId of this new company is automatically set to BP company's catalogId.
     * <br/> When an `organization_admin>` creates a company, catalogId of this new company is automatically set to organization_admin's company's catalogId.
     * <br/>
     * <br/> Only `superadmin` can set a different catalogId to a company.
     * <br/> `adminCanSetCustomData` can only be set:
     *   - by `superadmin` (all companies),
     *   - by `bp_admin` or `bp_finance` for the companies he manages,
     *   - by `organization_admin` for the companies he manages.
     * <br/> Object with free keys/values.
     * <br/> It is up to the client to manage the company's customData (new customData provided overwrite the existing one).
     * <br/><br/> Restrictions on customData Object:
     * <ul>
     *      <li>max 10 keys,</li>
     *      <li>max key length: 64 characters,</li>
     *      <li>max value length: 512 characters.</li>
     * </ul>
     * <br/><br/> Company customData can only be created/updated by:
     * <ul>
     *      <li>`superadmin` (all companies),</li>
     *      <li>`bp_admin` or `bp_finance` for the companies he manages (except his company if its `adminCanSetCustomData` setting is not set to true),</li>
     *      <li>`organization_admin` for the companies he manages,</li>
     *      <li>`company_admin` for his own company if its `adminCanSetCustomData` setting is set to true (setting that can only be set by a superadmin, his bp_admin, bp_finance or organization_admin)
     *     or if he has the feature `ADMIN_CAN_SET_CUSTOM_DATA` (if the feature is enabled, it overwrites the value of the company setting).</li>
     * </ul>
     * <br/> `bpId` must correspond to a valid company having `isBP` equal to true.
     * <br/> Only directly settable by `superadmin`.
     * <br/> If the company is <b>created</b> by a `bp_admin` or a `bp_finance`, `bpId` is automatically set to
     * BP company `id`.
     * <br/> For existing companies, `bp_admin` must use invitation mechanism to a company admin in order
     * to request a link of this company company to his BP company.
     * `bp_finance` allows the `company_admin` to update the subscriptions of his company (if enable, allowed operations depend of the value of `adminAllowedUpdateSubscriptionsOps`).
     * <br/> Can only be set by `superadmin` or `bp_finance` of the related company.
     * indicates the update operations for which the `bp_finance` allows the `company_admin` to perform on the subscriptions of his company.
     * <br/> Can only be set by `superadmin` or `bp_finance` of the related company.
     * <br/> Possible values:
     * - `all: company_admin is allowed to perform all update operations on the subscriptions of his company
     * - `increase_only: company_admin is only allowed to increase `maxNumberUsers` on the subscriptions of his company (decrease is forbidden)
     * - 'monthly': company_admin is only allowed to manage monthly subscription (increase and decrease)
     * <br/> Only settable by `superadmin`
     * - `IR`: Indirect Reseller,
     * - `VAD`: Value Added Distributor,
     * - `DR`: Direct Reseller.
     * <br/> Only applicable if `isBP` is true.
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true.
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true and `bpType` is DR or VAD.
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true and `bpType` is DR or VAD.
     * <br/> If `bpCRDid` is not defined, BP won't be able to sell (i.e. `bpHasRightToSell` can't be set to true)
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true and `bpType` is DR or VAD.
     * <br/> Only applicable if `bpCRDid` is defined.
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true.
     * <br/> Only settable by `superadmin`.
     * <br/> Only applicable if `isBP` is true.
     * <br/> Only settable by `superadmin`.
     <br/> Only applicable if `isBP` is true.
     <br/> Only settable by `superadmin`.
     * <br/> Should be set by `bp_admin` or `bp_finance`.
     * <br/> Only applicable if `isBP` is true.
     * <br/> Only applicable by `superadmin` or by `bp_admin` or `bp_finance` on one of his Indirect Resellers / End Customers companies.
     * <br/> Only applicable by `superadmin` or by `bp_admin` or `bp_finance` on one of his Indirect Resellers / End Customers companies.
     * <br/> Only settable by users with `superadmin` or `business_admin` role(s).
     * When we can't rely on Internet and Google FCM services to wake-up the app or notify the app, we can fall back to a direct XMPP connection.</br>
     * For customers using Samsung devices with Google Play services, we must have an option on admin side to set this permanent connection mode, so that mobile apps can rely on this parameter. This option will be applied for the whole company.
     * <br/> Define if a user has the right to receive alert notification
     * <br/> alertNotificationReception can be:
     * - `enabled`: Each user of the company can receive alert notification.
     * - `disabled`: No user of the company can receive alert notification.
     * <br/> Define if a user has the right to send alert notification
     * <br/> alertNotificationSending can be:
     * - `enabled`: Each user of the company can send alert notification.
     * - `disabled`: No user of the company can send alert notification.
     * <br/> Define if a user is allowed to be called by the Rainbow conference bridge.
     * <br/> useDialOutCustomisation can be:
     * - `enabled`: The user can be called by the Rainbow conference bridge.
     * - `disabled`: The user can't be called by the Rainbow conference bridge.
     * - `released`: Default value, device firmware will be the official released one.
     * - `latest`: Device firmware can be a more up to date binary (e.g. early adopters)
     * <br/> If allowed by `superadmin`, `company admin` can then select the kind of firmware for all the users, or only for some of them.
     * <br/> Only settable by users with `superadmin` or `business_admin` role(s).
     * <br/> This param only applies for BP companies.

     * @param name
     * @param country
     * @param street
     * @param city
     * @param state
     * @param postalCode
     * @param currency
     * @param status Company status. If company status is `initializing`, only `superadmin` can change the status value.
     * @param offerType Company offer type. Companies with offerType=`freemium` are not able to subscribe to paid offers, they must be `premium` to do so.
     * @param visibility
     * @param visibleBy
     * @param adminEmail
     * @param supportEmail
     * @param supportUrlFAQ
     * @param companyContactId
     * @param disableCCareAdminAccess
     * @param disableCCareAdminAccessCustomers
     * @param disableCCareAdminAccessResellers
     * @param autoAcceptUserInvitations
     * @param autoAddToUserNetwork
     * @param contentPolicyLifeTime
     * @param documentGracePeriod
     * @param userSelfRegisterAllowedDomains
     * @param slogan
     * @param description
     * @param size
     * @param economicActivityClassification
     * @param website
     * @param giphyEnabled
     * @param catalogId Id of the catalog of Rainbow offers to which the company is linked. Only `superadmin` can change the catalogId of a company.
     * @param adminCanSetCustomData
     * @param customData
     * @param bpId
     * @param adminHasRightToUpdateSubscriptions
     * @param adminAllowedUpdateSubscriptionsOps
     * @param isBP
     * @param bpType
     * @param bpBusinessModel
     * @param bpApplicantNumber
     * @param bpCRDid
     * @param bpHasRightToSell
     * @param bpHasRightToConnect
     * @param bpHasRightForBYOT
     * @param preferredSipLoadBalancerId
     * @param bpIsContractAccepted
     * @param externalReference
     * @param externalReference2
     * @param salesforceAccountId
     * @param avatarShape
     * @param isCentrex
     * @param companyCallNumber
     * @param superadminComment
     * @param bpBusinessType
     * @param billingModel
     * @param allowUsersSelectTheme Allow users of this company to select a theme among the ones available (owned or visible by the company).
     * @param allowUsersSelectPublicTheme Allow users of this company to select a public theme.
     * @param selectedTheme
     * @param mobilePermanentConnectionMode
     * @param alertNotificationReception
     * @param alertNotificationSending
     * @param useDialOutCustomisation
     * @param allowDeviceFirmwareSelection
     * @param selectedDeviceFirmware
     * @param cloudPbxVoicemailToEmail
     * @param businessData
     * @param defaultLicenseGroup
     * @param defaultOptionsGroups
     * @param selectedThemeCustomers
     * @param allowTeamsToDesktopSso
     * @param cloudPbxRecordingInboundOnly When CloudPbx recording is set, both inbound and outbound calls will be recorded for the selected users. If cloudPbxRecordingInboundOnly is set to true, only inbound calls will be recorded.
     * @param supervisionGroupMaxSize Maximum number of users a company can supervise.
     * @param supervisionGroupMaxNumber Maximum number of supervision groups a supervisor can belong to.
     * @param supervisionGroupMaxUsers Maximum number of users in a supervision group (supervisor included).
     * @param timezone User timezone name.
     * @param sendPrepaidSubscriptionsNotification Indicates if company_admin should receive email notification about prepaid subscriptions expiring soon. Used only on end customer companies.
     * @param ddiReadOnly Indicates if admin of IR company is allowed to create or delete a DDI. Used only on IR companies.
     * @param allowPhoneNumbersVisibility Indicates if Phone numbers should be visible or not when generating Voice CDR files. Applies only on BP companies.
     * @param csEmailList A list of Customer Success email addresses (maximum length : 10).
     * @param seEmailList A list of System Engineer email addresses (maximum length : 10).
     * @param csmEmailList A list of Channel Sales Manager email addresses (maximum length : 10).
     * @param kamEmailList A list of Key Account Manager email addresses (maximum length : 10).
     * @param businessSpecific Allow to specify if company has access to specific offers. Only settable by superadmin or business_admin.
     * @param adminServiceNotificationsLevel Level of service notification that admin should see.
     */
    updateCompany(_companyId : string, selectedThemeObj: boolean, name : string, country : string = "FRA", street : string, city : string, state : string, postalCode : string, offerType : string ="freemium",
currency : string, status : string, visibility : string = "private", visibleBy: string[], adminEmail : string, supportEmail : string, supportUrlFAQ : string, companyContactId : string, disableCCareAdminAccess : boolean,
disableCCareAdminAccessCustomers : boolean, disableCCareAdminAccessResellers : boolean, autoAcceptUserInvitations : boolean = true, autoAddToUserNetwork : boolean = false, contentPolicyLifeTime : boolean,
documentGracePeriod : boolean, userSelfRegisterAllowedDomains : string[], slogan : string, description : string, size : string = "self-employed", economicActivityClassification : string, website : string,
giphyEnabled : boolean, catalogId : string, adminCanSetCustomData : boolean, customData : any, bpId : string, adminHasRightToUpdateSubscriptions : boolean, adminAllowedUpdateSubscriptionsOps : string, isBP : boolean,
bpType : string, bpBusinessModel : string, bpApplicantNumber : string, bpCRDid : string, bpHasRightToSell : boolean, bpHasRightToConnect : boolean, bpHasRightForBYOT : boolean, preferredSipLoadBalancerId : string,
bpIsContractAccepted : boolean, externalReference : string, externalReference2 : string, salesforceAccountId : string, avatarShape : string, isCentrex: boolean, companyCallNumber : string, superadminComment : string,
bpBusinessType : string[], billingModel : string, allowUsersSelectTheme: boolean, allowUsersSelectPublicTheme: boolean, selectedTheme: any, mobilePermanentConnectionMode: boolean,
alertNotificationReception : string, alertNotificationSending : string, useDialOutCustomisation : string, allowDeviceFirmwareSelection: boolean, selectedDeviceFirmware : string, cloudPbxVoicemailToEmail : string,
businessData : any, defaultLicenseGroup : string, defaultOptionsGroups : string[], selectedThemeCustomers : any, allowTeamsToDesktopSso: boolean =true, cloudPbxRecordingInboundOnly?: boolean,
supervisionGroupMaxSize?: number, supervisionGroupMaxNumber?: number, supervisionGroupMaxUsers?: number,
timezone?: string, sendPrepaidSubscriptionsNotification?: boolean, ddiReadOnly?: boolean, allowPhoneNumbersVisibility?: boolean, csEmailList?: string[], seEmailList?: string[], csmEmailList?: string[],
kamEmailList?: string[], businessSpecific?: string, adminServiceNotificationsLevel?: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-companies-PutCompanies
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId

        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            url = urlParamsTab[0];

            let data: any = {};
            //addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);
            addPropertyToObj(data, "name", name, false);
            addPropertyToObj(data, "country", country, false);
            addPropertyToObj(data, "street", street, false);
            addPropertyToObj(data, "city", city, false);
            addPropertyToObj(data, "state", state, false);
            addPropertyToObj(data, "postalCode", postalCode, false);
            addPropertyToObj(data, "offerType", offerType, false);
            addPropertyToObj(data, "currency", currency, false);
            addPropertyToObj(data, "status", status, false);
            addPropertyToObj(data, "visibility", visibility, false);
            addPropertyToObj(data, "visibleBy", visibleBy, false);
            addPropertyToObj(data, "adminEmail", adminEmail, false);
            addPropertyToObj(data, "supportEmail", supportEmail, false);
            addPropertyToObj(data, "supportUrlFAQ", supportUrlFAQ, false);
            addPropertyToObj(data, "companyContactId", companyContactId, false);
            addPropertyToObj(data, "disableCCareAdminAccess", disableCCareAdminAccess, false);
            addPropertyToObj(data, "disableCCareAdminAccessCustomers", disableCCareAdminAccessCustomers, false);
            addPropertyToObj(data, "disableCCareAdminAccessResellers", disableCCareAdminAccessResellers, false);
            addPropertyToObj(data, "autoAcceptUserInvitations", autoAcceptUserInvitations, false);
            addPropertyToObj(data, "autoAddToUserNetwork", autoAddToUserNetwork, false);
            addPropertyToObj(data, "contentPolicyLifeTime", contentPolicyLifeTime, false);
            addPropertyToObj(data, "documentGracePeriod", documentGracePeriod, false);
            addPropertyToObj(data, "userSelfRegisterAllowedDomains", userSelfRegisterAllowedDomains, false);
            addPropertyToObj(data, "slogan", slogan, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "size", size, false);
            addPropertyToObj(data, "economicActivityClassification", economicActivityClassification, false);
            addPropertyToObj(data, "website", website, false);
            addPropertyToObj(data, "giphyEnabled", giphyEnabled, false);
            addPropertyToObj(data, "catalogId", catalogId, false);
            addPropertyToObj(data, "adminCanSetCustomData", adminCanSetCustomData, false);
            addPropertyToObj(data, "customData", customData, false);
            addPropertyToObj(data, "bpId", bpId, false);
            addPropertyToObj(data, "adminHasRightToUpdateSubscriptions", adminHasRightToUpdateSubscriptions, false);
            addPropertyToObj(data, "adminAllowedUpdateSubscriptionsOps", adminAllowedUpdateSubscriptionsOps, false);
            addPropertyToObj(data, "isBP", isBP, false);
            addPropertyToObj(data, "bpType", bpType, false);
            addPropertyToObj(data, "bpBusinessModel", bpBusinessModel, false);
            addPropertyToObj(data, "bpApplicantNumber", bpApplicantNumber, false);
            addPropertyToObj(data, "bpCRDid", bpCRDid, false);
            addPropertyToObj(data, "bpHasRightToSell", bpHasRightToSell, false);
            addPropertyToObj(data, "bpHasRightToConnect", bpHasRightToConnect, false);
            addPropertyToObj(data, "bpHasRightForBYOT", bpHasRightForBYOT, false);
            addPropertyToObj(data, "preferredSipLoadBalancerId", preferredSipLoadBalancerId, false);
            addPropertyToObj(data, "bpIsContractAccepted", bpIsContractAccepted, false);
            addPropertyToObj(data, "externalReference", externalReference, false);
            addPropertyToObj(data, "externalReference2", externalReference2, false);
            addPropertyToObj(data, "salesforceAccountId", salesforceAccountId, false);
            addPropertyToObj(data, "avatarShape", avatarShape, false);
            addPropertyToObj(data, "isCentrex", isCentrex, false);
            addPropertyToObj(data, "companyCallNumber", companyCallNumber, false);
            addPropertyToObj(data, "superadminComment", superadminComment, false);
            addPropertyToObj(data, "bpBusinessType", bpBusinessType, false);
            addPropertyToObj(data, "billingModel", billingModel, false);
            addPropertyToObj(data, "allowUsersSelectTheme", allowUsersSelectTheme, false);
            addPropertyToObj(data, "allowUsersSelectPublicTheme", allowUsersSelectPublicTheme, false);
            addPropertyToObj(data, "selectedTheme", selectedTheme, false);
            addPropertyToObj(data, "mobilePermanentConnectionMode", mobilePermanentConnectionMode, false);
            addPropertyToObj(data, "alertNotificationReception", alertNotificationReception, false);
            addPropertyToObj(data, "alertNotificationSending", alertNotificationSending, false);
            addPropertyToObj(data, "useDialOutCustomisation", useDialOutCustomisation, false);
            addPropertyToObj(data, "allowDeviceFirmwareSelection", allowDeviceFirmwareSelection, false);
            addPropertyToObj(data, "selectedDeviceFirmware", selectedDeviceFirmware, false);
            addPropertyToObj(data, "cloudPbxVoicemailToEmail", cloudPbxVoicemailToEmail, false);
            addPropertyToObj(data, "businessData", businessData, false);
            addPropertyToObj(data, "defaultLicenseGroup", defaultLicenseGroup, false);
            addPropertyToObj(data, "defaultOptionsGroups", defaultOptionsGroups, false);
            addPropertyToObj(data, "selectedThemeCustomers", selectedThemeCustomers, false);
            addPropertyToObj(data, "allowTeamsToDesktopSso", allowTeamsToDesktopSso, false);
            addPropertyToObj(data, "cloudPbxRecordingInboundOnly", cloudPbxRecordingInboundOnly, false);
            addPropertyToObj(data, "supervisionGroupMaxSize", supervisionGroupMaxSize, false);
            addPropertyToObj(data, "supervisionGroupMaxNumber", supervisionGroupMaxNumber, false);
            addPropertyToObj(data, "supervisionGroupMaxUsers", supervisionGroupMaxUsers, false);
            addPropertyToObj(data, "timezone", timezone, false);
            addPropertyToObj(data, "sendPrepaidSubscriptionsNotification", sendPrepaidSubscriptionsNotification, false);
            addPropertyToObj(data, "ddiReadOnly", ddiReadOnly, false);
            addPropertyToObj(data, "allowPhoneNumbersVisibility", allowPhoneNumbersVisibility, false);
            addPropertyToObj(data, "csEmailList", csEmailList, false);
            addPropertyToObj(data, "seEmailList", seEmailList, false);
            addPropertyToObj(data, "csmEmailList", csmEmailList, false);
            addPropertyToObj(data, "kamEmailList", kamEmailList, false);
            addPropertyToObj(data, "businessSpecific", businessSpecific, false);
            addPropertyToObj(data, "adminServiceNotificationsLevel", adminServiceNotificationsLevel, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCompanyAppFeatureCustomisation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCompanyAppFeatureCustomisation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company Management

    //region Companies RainbowMFA Settings

    createRainbowMultifactorAuthenticationServerConfiguration (_companyId : string, enabledForAllCompanyUsers : boolean, mfaName : string, mfaType : string, mfaPolicy : string, rememberDaysApplication : string, mfaCanBeDisabled : boolean) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PostCompanyRainbowMFASettings
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa";
            let data: any = {};
            addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);
            addPropertyToObj(data, "mfaName", mfaName, false);
            addPropertyToObj(data, "mfaType", mfaType, false);
            addPropertyToObj(data, "mfaPolicy", mfaPolicy, false);
            addPropertyToObj(data, "rememberDaysApplication", rememberDaysApplication, false);
            addPropertyToObj(data, "mfaCanBeDisabled", mfaCanBeDisabled, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createRainbowMultifactorAuthenticationServerConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createRainbowMultifactorAuthenticationServerConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createRainbowMultifactorAuthenticationServerConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createRainbowMultifactorAuthenticationServerConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    deleteRainbowMultifactorConfiguration (_companyId : string, mfaId : string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-DeleteCompanyRainbowMFASettings
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteRainbowMultifactorConfiguration) companyId", companyId);
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getRainbowMultifactorConfiguration (_companyId : string, mfaId : string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetCompanyRainbowMFASettings
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "joinCompanyLinkId", joinCompanyLinkId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowMultifactorConfiguration) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getAllRainbowMultifactorConfiguration (_companyId : string, format : string = "medium") {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetAllCompanyRainbowMFASettings
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "joinCompanyLinkId", joinCompanyLinkId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllRainbowMultifactorConfiguration) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    updateRainbowMultifactorAuthenticationConfiguration (_companyId : string, mfaId : string, enabledForAllCompanyUsers : boolean, mfaName : string, mfaType : string, mfaPolicy : string, rememberDaysApplication : string, mfaCanBeDisabled : boolean) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PutCompanyRainbowMFASettings
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId

        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            let data: any = {};
            addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);
            addPropertyToObj(data, "mfaName", mfaName, false);
            addPropertyToObj(data, "mfaType", mfaType, false);
            addPropertyToObj(data, "mfaPolicy", mfaPolicy, false);
            addPropertyToObj(data, "rememberDaysApplication", rememberDaysApplication, false);
            addPropertyToObj(data, "mfaCanBeDisabled", mfaCanBeDisabled, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies RainbowMFA Settings

    //region Company join companies links

    createAJoinCompanyLink(_companyId: string, description: string = undefined, isEnabled: boolean = true, expirationDate: string = undefined, maxNumberUsers: number = undefined) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-PostJoinCompaniesLinks
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let data: any = {};
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "isEnabled", isEnabled, false);
            addPropertyToObj(data, "expirationDate", expirationDate, false);
            addPropertyToObj(data, "maxNumberUsers", maxNumberUsers, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAJoinCompanyLink) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAJoinCompanyLink(_companyId: string, joinCompanyLinkId: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-DeleteJoinCompaniesLinksById
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteAJoinCompanyLink) companyId", companyId);
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links/" + joinCompanyLinkId
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    getAJoinCompanyLink(companyId: string, joinCompanyLinkId: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinksById
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links/" + joinCompanyLinkId';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "joinCompanyLinkId", joinCompanyLinkId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAJoinCompanyLink) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyLinks(_companyId, format: string = "small", createdByAdminId: string = undefined, isEnabled: boolean = undefined, fromExpirationDate: string = undefined, toExpirationDate: string = undefined,
                           fromNbUsersRegistered: string = undefined, toNbUsersRegistered: string = undefined, limit: number = 100, offset: number = 0, sortField: string = undefined, sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinks
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "createdByAdminId", createdByAdminId);
            addParamToUrl(urlParamsTab, "isEnabled", isEnabled);
            addParamToUrl(urlParamsTab, "fromExpirationDate", fromExpirationDate);
            addParamToUrl(urlParamsTab, "toExpirationDate", toExpirationDate);
            addParamToUrl(urlParamsTab, "fromNbUsersRegistered", fromNbUsersRegistered);
            addParamToUrl(urlParamsTab, "toNbUsersRegistered", toNbUsersRegistered);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyLinks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyLinks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyLinks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyLinks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyLinks) error : ", err);
                return reject(err);
            });
        });
    }

    updateAJoinCompanyLink(_companyId: string, joinCompanyLinkId: string, description: string, isEnabled: boolean = true,
                           expirationDate: string, maxNumberUsers: number) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-PutJoinCompaniesLinks
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId

        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let data: any = {};
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "isEnabled", isEnabled, false);
            addPropertyToObj(data, "expirationDate", expirationDate, false);
            addPropertyToObj(data, "maxNumberUsers", maxNumberUsers, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join companies links

    //region Company from end user portal

    createCompanyFromDefault(name, visibility: string = "public", country?: string, state?: string, slogan?: string, description?: string, size?: string, economicActivityClassification ?: string, website ?: string, avatarShape ?: string, giphyEnabled?: boolean) {
        // API https://api.openrainbow.org/enduser/#api-companies-createCompany
        // URL post /api/rainbow/enduser/v1.0/companies
        let that = this;
        return new Promise(function (resolve, reject) {
            let countryObj: any = {
                name: name,
                country: "Fr",
                state: null,
            };

            if (visibility) {
                countryObj.visibility = visibility;
            }
            if (country) {
                countryObj.country = country;
            }
            if (state) {
                countryObj.state = state;
            }
            if (slogan) {
                countryObj.slogan = slogan
            }
            if (description) {
                countryObj.description = description
            }
            if (size) {
                countryObj.size = size
            }
            if (economicActivityClassification) {
                countryObj.economicActivityClassification = economicActivityClassification
            }
            if (website) {
                countryObj.website = website
            }
            if (avatarShape) {
                countryObj.avatarShape = avatarShape
            }
            if (giphyEnabled) {
                countryObj.slogan = giphyEnabled
            }

            that.http.post('/api/rainbow/enduser/v1.0/companies', that.getRequestHeader(), countryObj, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCompanyFromDefault) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCompanyFromDefault) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCompanyFromDefault) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCompanyFromDefault) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCompaniesVisibleByUser(format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1, name ?: string, status ?: string, visibility ?: string, organisationId ?: string, isBP ?: boolean, hasBP ?: boolean, bpType ?: string) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanies
        // URL get /api/rainbow/enduser/v1.0/companies
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompaniesVisibleByUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCompaniesVisibleByUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompaniesVisibleByUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCompaniesVisibleByUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCompaniesVisibleByUser) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyAdministrators(companyId: string, format: string = "small", limit: number = 100, offset: number = 0) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanyAdministrators
        // URL get /api/rainbow/enduser/v1.0/companies/:companyId/administrators
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies/' + companyId + '/administrators';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAdministrators) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyAdministrators) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAdministrators) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyAdministrators) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyAdministrators) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company from end user portal

    //region Company visibility

    setVisibilityForCompany(companyId, visibleByCompanyId) {
        // API https://api.openrainbow.org/admin/#api-companies_visibility-PostCompaniesVisibility
        // URL post /api/rainbow/admin/v1.0/companies/:companyId/visible-by/:otherCompanyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post('/api/rainbow/admin/v1.0/companies/' + companyId + "/visible-by/" + visibleByCompanyId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setVisibilityForCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setVisibilityForCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setVisibilityForCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setVisibilityForCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company visibility

    //region Company join company invitations

    acceptJoinCompanyInvitation(invitationId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-acceptJoinCompanyInvitation
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/accept
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/invitations/" + invitationId + "/accept";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptJoinCompanyInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    declineJoinCompanyInvitation(invitationId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-declineJoinCompanyInvitation
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/decline
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/invitations/" + invitationId + "/decline";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(declineJoinCompanyInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    getJoinCompanyInvitation(invitationId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitationById
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/invitations/" + invitationId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyInvitation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyInvitation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyInvitations(sortField: string = "lastNotificationDate", status: string, format: string = "small", limit: number = 100, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitations
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/invitations";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyInvitations) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyInvitations) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join company invitations

    //region Company join company requests

    cancelJoinCompanyRequest(joinCompanyRequestId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-cancelJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/cancel
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/requests/" + joinCompanyRequestId + "/cancel";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(cancelJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(cancelJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(cancelJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    getJoinCompanyRequest(joinCompanyRequestId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequestById
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/requests/" + joinCompanyRequestId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyRequest) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyRequests(sortField: string = "lastNotificationDate", status: string, format: string = "small", limit: number = 100, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequests
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/requests";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyRequests) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyRequests) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyRequests) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyRequests) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyRequests) error : ", err);
                return reject(err);
            });
        });
    }

    resendJoinCompanyRequest(joinCompanyRequestId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-resendJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/re-send
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/requests/" + joinCompanyRequestId + "/re-send";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(resendJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resendJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resendJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resendJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    requestToJoinCompany(requestedCompanyId?: string, requestedCompanyAdminId?: string, requestedCompanyLinkId?: string, lang: string = "en") {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-sendJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/join-companies/requests/";
            let data: any = {};
            addPropertyToObj(data, "requestedCompanyId", requestedCompanyId, false);
            addPropertyToObj(data, "requestedCompanyAdminId", requestedCompanyAdminId, false);
            addPropertyToObj(data, "requestedCompanyLinkId", requestedCompanyLinkId, false);
            addPropertyToObj(data, "lang", lang, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(requestToJoinCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(requestToJoinCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(requestToJoinCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(requestToJoinCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join company requests

    //region Companies Customization Emails

    getEmailTemplatesDocumentation (format : string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmailsDocumentation
        // URL GET /api/rainbow/admin/v1.0/companies/customizations/emails
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/customizations/emails";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesDocumentation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getEmailTemplatesDocumentation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesDocumentation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmailTemplatesDocumentation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmailTemplatesDocumentation) error : ", err);
                return reject(err);
            });
        });
    }

    initiateEmailTemplate(_companyId: string, templateName : string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-CreateCompanyCustomizationEmails
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails";
            let data: any = {};
            addPropertyToObj(data, "templateName", templateName, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateEmailTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateSubjectPartTemplate (_companyId: string, templateName : string, body : any) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsSubject
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/subject
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/subject";
            let data: any = body;
            //addPropertyToObj(data, "templateName", templateName, false);

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSubjectPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSubjectPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSubjectPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSubjectPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateMjmlFormatPartTemplate (_companyId: string, templateName : string, body : any) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsMjml
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/mjml-format
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/mjml-format";
            let data: any = body;
            //addPropertyToObj(data, "templateName", templateName, false);

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateMjmlFormatPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateMjmlFormatPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateMjmlFormatPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateMjmlFormatPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateTextFormatFormatPartTemplate (_companyId: string, templateName : string, body : any) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsText
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/text-format
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/text-format";
            let data: any = body;
            //addPropertyToObj(data, "templateName", templateName, false);

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTextFormatFormatPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTextFormatFormatPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTextFormatFormatPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTextFormatFormatPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getEmailTemplatesByCompanyId  (_companyId: string, templateName : string, format : any) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmails
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "templateName", templateName);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesByCompanyId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getEmailTemplatesByCompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesByCompanyId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmailTemplatesByCompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmailTemplatesByCompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    deleteEmailTemplate(_companyId: string, templateName : string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteOneCompanyCustomizationEmail
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId?_companyId : that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteEmailTemplate) url", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteEmailTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAvailableEmailTemplatesBycompanyId(_companyId: string, templateName : string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteCompanyCustomizationEmails
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/all
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId?_companyId : that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/all";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "templateName", templateName);
            url = urlParamsTab[0];
            that._logger.log(that.DEBUG, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) url", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAvailableEmailTemplatesBycompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAvailableEmailTemplatesBycompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    testEmailTemplateRendering(_companyId: string, body : any): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-PostCompanyCustomizationEmailsRendering
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/rendering
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/rendering";
            let data: any = body;
            // addPropertyToObj(data, "templateName", templateName, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(testEmailTemplateRendering) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(testEmailTemplateRendering) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(testEmailTemplateRendering) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(testEmailTemplateRendering) error : ", err);
                return reject(err);
            });
        });
    }

    activateDesactivateEmailTemplate (_companyId : string, templateName : string, isActive) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-ActivateOneCompanyCustomizationEmail
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/activation
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/activation";
            let data: any = {};
            addPropertyToObj(data, "isActive", isActive, false);
            addPropertyToObj(data, "templateName", templateName, false);

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateDesactivateEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateDesactivateEmailTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateDesactivateEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateDesactivateEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies Customization Emails

    //endregion Company

    //region Customisation Template 

    applyCustomisationTemplates(name: string, companyId: string, userId: string) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-ApplyCompanyTemplate
        // URL POST /api/rainbow/admin/v1.0/customisations/templates/apply
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                name,
                companyId,
                userId
            };

            that.http.post("/api/rainbow/admin/v1.0/customisations/templates/apply", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(applyTemplates) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(applyTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(applyTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(applyTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string,
                                fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string,
                                useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string,
                                userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string,
                                fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(applyTemplates) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(applyTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(applyTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(applyTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCustomisationTemplate(templateId) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-DeleteCompanyTemplate
        // URL delete /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomisationTemplate) templateId", templateId);
            that.http.delete('/api/rainbow/admin/v1.0/customisations/templates/' + templateId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getAllAvailableCustomisationTemplates(companyId: string = undefined, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCustomisationTemplateAll
        // URL get /api/rainbow/admin/v1.0/customisations/templates
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/customisations/templates";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllAvailableCustomisationTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getAllAvailableCustomisationTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllAvailableCustomisationTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllAvailableCustomisationTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllAvailableCustomisationTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    getRequestedCustomisationTemplate(templateId: string = undefined) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCompanyTemplate
        // URL get /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/customisations/templates/" + templateId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getRequestedCustomisationTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that._logger.log(that.DEBUG, LOG_ID + "(getRequestedCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRequestedCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRequestedCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRequestedCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[],
                                instantMessagesCustomisation: string = "enabled", useGifCustomisation: string = "enabled", fileSharingCustomisation: string = "enabled", fileStorageCustomisation: string = "enabled", phoneMeetingCustomisation: string = "enabled",
                                useDialOutCustomisation: string = "enabled", useChannelCustomisation: string = "enabled", useRoomCustomisation: string = "enabled", useScreenSharingCustomisation: string = "enabled", useWebRTCAudioCustomisation: string = "enabled",
                                useWebRTCVideoCustomisation: string = "enabled", recordingConversationCustomisation: string = "enabled", overridePresenceCustomisation: string = "enabled", userProfileCustomisation: string = "enabled",
                                userTitleNameCustomisation: string = "enabled", changeTelephonyCustomisation: string = "enabled", changeSettingsCustomisation: string = "enabled", fileCopyCustomisation: string = "enabled",
                                fileTransferCustomisation: string = "enabled", forbidFileOwnerChangeCustomisation: string = "enabled", readReceiptsCustomisation: string = "enabled", useSpeakingTimeStatistics: string = "enabled") {
        // API https://api.openrainbow.org/admin/#api-customisation_template-UpdateCompanyTemplate
        // URL PUT /api/rainbow/admin/v1.0/customisations/templates/:templateId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                name,
                visibleBy,
                instantMessagesCustomisation,
                useGifCustomisation,
                fileSharingCustomisation,
                fileStorageCustomisation,
                phoneMeetingCustomisation,
                useDialOutCustomisation,
                useChannelCustomisation,
                useRoomCustomisation,
                useScreenSharingCustomisation,
                useWebRTCAudioCustomisation,
                useWebRTCVideoCustomisation,
                recordingConversationCustomisation,
                overridePresenceCustomisation,
                userProfileCustomisation,
                userTitleNameCustomisation,
                changeTelephonyCustomisation,
                changeSettingsCustomisation,
                fileCopyCustomisation,
                fileTransferCustomisation,
                forbidFileOwnerChangeCustomisation,
                readReceiptsCustomisation,
                useSpeakingTimeStatistics
            };

            that.http.put("/api/rainbow/admin/v1.0/customisations/templates/" + templateId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCustomisationTemplate) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(createPublicChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPublicChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPublicChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPublicChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // get a channel
    /* getChannel(channelId) {
         let that = this;

         return new Promise(function(resolve, reject) {

             that._logger.log(that.DEBUG, LOG_ID + "(getChannel) _entering_");

             that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader()).then(function(json) {
                 that._logger.log(that.DEBUG, LOG_ID + "(getChannel) successfull");
                 that._logger.log(that.INTERNAL, LOG_ID + "(getChannel) REST read channelId : ", json.data);
                 that._logger.log(that.DEBUG, LOG_ID + "(getChannel) _exiting_");
                 resolve(json?.data);
             }).catch(function(err) {
                 that._logger.log(that.ERROR, LOG_ID, "(getChannel) error : ", err);
                 that._logger.log(that.DEBUG, LOG_ID + "(getChannel) _exiting_");
                 reject(err);
             });
         });
     } // */

    // Delete a channel
    deleteChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteChannel) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteChannel) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(findChannels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(findChannels) REST result : ", json.total);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(findChannels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(findChannels) error : ", err);
                return reject(err);
            });
        });
    }

    // Get my channels
    getChannels() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(fetchMyChannels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(fetchMyChannels) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(fetchMyChannels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(fetchMyChannels) error : ", err);
                return reject(err);
            });
        });
    }

    getChannel(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + id, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Publish a message to a channel
    publishMessage(channelId, message, title, url, imagesIds, type, customDatas : any = {}) {
        let that = this;
        return new Promise((resolve, reject) => {
            let payload = Object.assign({
                type,
                message: message,
                title: title || "",
                url: url || "",
                images: null
            }, customDatas);

            if (imagesIds) {
                payload.images = imagesIds || null;
            }

            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/publish", that.getRequestHeader(), payload, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(publishMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishMessage) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(publishMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(publishMessage) error : ", err);
                return reject(err);
            });
        });
    }

    private chewReceivedItems(items: any[]): void {
        items.forEach((item) => {
            if (item.type==="urn:xmpp:channels:simple") {
                item["entry"] = {message: item.message};
                delete item.message;
            }
            item.displayId = item.id + "-" + item.timestamp;
            item.modified = item.creation!==undefined;
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
                that._logger.log(that.DEBUG, LOG_ID + "(getLatestMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getLatestMessages) REST result : " + JSON.stringify(json) + " latestMessages");
                that.chewReceivedItems(json.data.items);
                resolve(json.data.items);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getLatestMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getLatestMessages) error : ", err);
                return reject(err);
            });
        });
    };

    // Subscribe to a channel
    subscribeToChannel(channelId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeToChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeToChannel) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeToChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Unsubscribe to a channel
    unsubscribeToChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unsubscribeToChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unsubscribeToChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unsubscribeToChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unsubscribeToChannel) error : ", err);
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
        if (title===null) {
            delete channel.topic;
        } else {
            channel.topic = title;
        }
        if (visibility===null) {
            delete channel.visibility;
        } else {
            channel.visibility = visibility;
        }
        if (mode===null) {
            delete channel.mode;
        } else {
            channel.mode = mode;
        }
        if (max_items===null) {
            delete channel.max_items;
        } else {
            channel.max_items = max_items;
        }
        if (max_payload_size===null) {
            delete channel.max_payload_size;
        } else {
            channel.max_payload_size = max_payload_size;
        }
        if (channelName===null) {
            delete channel.name;
        } else {
            channel.name = channelName;
        }
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader(), channel, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateChannel) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(uploadChannelAvatar) successfull channelId : ", channelId);
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadChannelAvatar) REST result : ", response);
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
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteChannelAvatar) successfull channelId : ", channelId);
                        that._logger.log(that.INTERNAL, LOG_ID + "(deleteChannelAvatar) REST result : ", response);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getChannelUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannelUsers) REST result : ", json.total, " users in channel");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannelUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    // Delete all users in channel
    deleteAllUsersFromChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAllUsersFromChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllUsersFromChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAllUsersFromChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllUsersFromChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a collection of channel users
    updateChannelUsers(channelId, users) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader(), {"data": users}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateChannelUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateChannelUsers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateChannelUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a collection of channel users
    getChannelMessages(channelId, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {max: maxMessages}
            if (beforeDate) {
                params.before = beforeDate;
            }
            if (afterDate) {
                params.after = afterDate;
            }
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannelMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannelMessages) REST result : ", json.data.items.length);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannelMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannelMessages) error : ", err);
                return reject(err);
            });
        });
    }

    likeItem(channelId, itemId, appreciation) {
        let that = this;
        let data = {"appreciation": appreciation};
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/like", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(likeItem) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(likeItem) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(likeItem) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(likeItem) error : ", err);
                return reject(err);
            });
        });
    }

    getDetailedAppreciations(channelId, itemId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/likes", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getDetailedAppreciations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDetailedAppreciations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDetailedAppreciations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDetailedAppreciations) error : ", err);
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
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- success");
                        resolve(itemId);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ", err.message);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getServerProfiles) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerProfiles) REST result : ", json, " profiles");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerProfiles) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    // Get Server Profiles
    getServerProfilesFeatures() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/profiles/features", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerProfilesFeatures) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerProfilesFeatures) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerProfilesFeatures) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerProfilesFeatures) error : ", err);
                return reject(err);
            });
        });
    }

    public async getThirdPartyApps() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/authentication/v1.0/oauth/tokens?format=medium", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getThirdPartyApps) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getThirdPartyApps) REST result : ", json, " ThirdPartyApps.");
                resolve((json && json.data) ? json?.data:[]);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getThirdPartyApps) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getThirdPartyApps) error : ", err);
                return reject(err);
            });
        });
    }

    async revokeThirdPartyAccess(tokenId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/authentication/v1.0/oauth/tokens/" + tokenId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(revokeThirdPartyAccess) (" + tokenId + ") -- success");
                resolve((json && json.data) ? json?.data:[]);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure -- ");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure -- ", err.message);
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
                that._logger.log(that.DEBUG, LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error : ", err);
                return reject(err);
            });
        });
    }

    // region Telephony Voice Messages

    deleteAllMyVoiceMessagesFromPbx() {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
        let that = this;
        return that.restTelephony.deleteAllMyVoiceMessagesFromPbx(that.getPostHeader());
    }

    deleteAVoiceMessageFromPbx(messageId) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
        let that = this;
        return that.restTelephony.deleteAVoiceMessageFromPbx(that.getPostHeader(), messageId);
    }

    getAVoiceMessageFromPbx(messageId: string, messageDate: string, messageFrom: string) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read 
        // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
        let that = this;
        return that.restTelephony.getAVoiceMessageFromPbx(that.getRequestHeader(), messageId, messageDate, messageFrom);
    }

    getDetailedListOfVoiceMessages() {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list 
        // GET /api/rainbow/telephony/v1.0/voicemessages
        let that = this;
        return that.restTelephony.getDetailedListOfVoiceMessages(that.getRequestHeader());
    }

    getNumbersOfVoiceMessages() {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
        // GET /api/rainbow/telephony/v1.0/voicemessages/counters
        let that = this;
        return that.restTelephony.getNumbersOfVoiceMessages(that.getRequestHeader());
    }

    // endregion Telephony Voice Messages

    //endregion Telephony

    //region Conversations

    async getTheNumberOfHitsOfASubstringInAllUsersconversations(userId: string, substring: string, limit: number = 100, webinar: boolean = true) {
        // API https://api.openrainbow.org/enduser/#api-conversations-countTextInConversations 
        // GET /api/rainbow/enduser/v1.0/users/:userId/conversations/search
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST userId : ", userId);

            let url: string = "/api/rainbow/admin/v1.0/users/" + userId + "/profiles";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "substring", substring);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "webinar", webinar);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTheNumberOfHitsOfASubstringInAllUsersconversations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTheNumberOfHitsOfASubstringInAllUsersconversations) error : ", err);
                return reject(err);
            });
        });
    }

    getServerConversations(format: string = "small", maxCount: number = undefined, lastUpdateDate: string = undefined, limit: number = 1000, offset: number = 0, before: number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST format : ", format);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations?format=" + format;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "maxCount", maxCount);
            addParamToUrl(urlParamsTab, "lastUpdateDate", lastUpdateDate);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "before", before);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerConversations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerConversations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerConversations) error : ", err);
                return reject(err);
            });
        });
    }

    createServerConversation(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations", that.getRequestHeader(), conversation, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createServerConversation) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(createServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(createServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteServerConversation(conversationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    //Update conversation
    updateServerConversation(conversationId, mute) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId, that.getRequestHeader(), {"mute": mute}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    // Send Conversation By Email
    sendConversationByEmail(conversationId, emails: Array<string> = undefined, lang: string = undefined) {
        let that = this;
        return new Promise((resolve, reject) => {

            let data: any = {};
            if (emails) {
                data.emails = emails;
            }
            if (lang) {
                data.lang = lang;
            }

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId + "/downloads", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendConversationByEmail) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendConversationByEmail) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendConversationByEmail) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendConversationByEmail) error : ", err);
                return reject(err);
            });
        });
    }

    ackAllMessages(conversationId, maskRead: boolean = false) {
        let that = this;
        return new Promise(function (resolve, reject) {

            let data: any = {};
            data.maskRead = maskRead;

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId + "/markallread", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ackAllMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ackAllMessages) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ackAllMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ackAllMessages) error : ", err);
                return reject(err);
            });
        });
    }

    updateConversationBookmark(userId: string, conversationId: string, messageId: string) {
        // API https://api.openrainbow.org/enduser/#api-conversations-setBookmarkInConversation
        // POST /api/rainbow/enduser/v1.0/users/:userId/conversations/:conversationId/bookmark

        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/" + conversationId + "/bookmark";
            let data: any = {};
            if (messageId) {
                data.messageId = messageId;
            }

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConversationBookmark) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConversationBookmark) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(updateConversationBookmark) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConversationBookmark) error : ", err);
                return reject(err);
            });
        });
    }

    deleteConversationBookmark(userId: string, conversationId: string) {
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/conversations/:conversationId/bookmark
        // API https://api.openrainbow.org/enduser/#api-conversations-removeBookmarkInConversation
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/" + conversationId + "/bookmark";
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) REST ");

            that.http.delete(url, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteConversationBookmark) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteConversationBookmark) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteConversationBookmark) error : ", err);
                return reject(err);
            });
        });

    }

    //endregion Conversations

    //region Country

    getListOfCountries() {
        // API https://api.openrainbow.org/enduser/#api-countries-getCountries
        // GET /api/rainbow/enduser/v1.0/countries
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountries) .");

            let url: string = "/api/rainbow/enduser/v1.0/countries";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "maxCount", maxCount);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountries) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfCountries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountries) REST result : ", JSON.stringify(json));
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfCountries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfCountries) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Country

    //region Generic HTTP VERB
    get(url, token) {
        let that = this;
        if (token)  { that.tokenRest = token; }
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader(), undefined).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(get) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    post(url, token, data, contentType) {
        let that = this;
        if (token)  { that.tokenRest = token; }
        return new Promise(function (resolve, reject) {
            that.http.post(url, that.getRequestHeader(), data, contentType).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(post) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    put(url, token, data) {
        let that = this;
        if (token)  { that.tokenRest = token; }
        return new Promise(function (resolve, reject) {
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(put) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    delete(url, token) {
        let that = this;
        if (token)  { that.tokenRest = token; }
        return new Promise(function (resolve, reject) {
            that.http.delete(url, that.getRequestHeader()).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(delete) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    //endregion http verbs

    //region Check Connection

    async checkEveryPortals() {
        let that = this;
        //that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) .");

        if (this._isOfficialRainbow) {
            let authenticationAbout = that.http.get("/api/rainbow/authentication/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.INFO, LOG_ID + "(checkEveryPortals) authentication about : ", portalAbout);
            });
            let enduserAbout = that.http.get("/api/rainbow/enduser/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.INFO, LOG_ID + "(checkEveryPortals) enduser about : ", portalAbout);
            });
            let telephonyAbout = that.http.get("/api/rainbow/telephony/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) telephony about : ", portalAbout);
            });
            let adminAbout = that.http.get("/api/rainbow/admin/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.INFO, LOG_ID + "(checkEveryPortals) admin about : ", portalAbout);
            });
            let channelsAbout = that.http.get("/api/rainbow/channels/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) channels about : ", portalAbout);
            });
            let applicationsAbout = that.http.get("/api/rainbow/applications/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) applications about : ", portalAbout);
            });

            return Promise.all([authenticationAbout, enduserAbout, telephonyAbout, adminAbout, channelsAbout, applicationsAbout]);
        } else {
            that._logger.log(that.INFO, LOG_ID + "(checkEveryPortals)", that.http._host, " NOT IN RAINBOW PRODUCTION so do not test every application's about status ");
            return Promise.resolve({'status': "OK"});
        }
    }

    checkPortalHealth(currentAttempt) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(checkPortalHealth) will get the ping to test connection for the currentAttempt : ", currentAttempt);
        return new Promise(function (resolve, reject) {
            // dev-code //
            //return reject({"error" : "force to failed checkPortalHealth for tests, currentAttempt : " + currentAttempt });
            // end-dev-code //

            that.http.get("/api/rainbow/ping", that.getRequestHeader(), undefined).then(function (JSON) {
                that._logger.log(that.INFO, LOG_ID + "(checkPortalHealth) Wait a few time (10 seconds ) before check every portals, because somes of it respond before being xmpp ready for currentAttempt : ", currentAttempt);
                that.timeOutManager.setTimeout(() => {
                    that.checkEveryPortals().then(() => {
                        that._logger.log(that.INFO, LOG_ID + "(checkPortalHealth) Connection succeeded for currentAttempt : ", currentAttempt);
                        resolve(JSON);
                    }).catch((err) => {
                        that._logger.log(that.INFO, LOG_ID + "(checkPortalHealth) Connection failed! for currentAttempt : ", currentAttempt);
                        return reject(err);
                    });
                }, 1000 * 10, "checkPortalHealth");
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(checkPortalHealth) ErrorManager for currentAttempt : ", currentAttempt);
                that._logger.log(that.INTERNALERROR, LOG_ID + "(checkPortalHealth) ErrorManager : ", err);
                return reject(err);
            });
        });
    }

    async checkRESTAuthentication(): Promise<boolean> {
        let that = this;
        //that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) .");
        let authStatus = false;

        try {
            let authenticationValidator = await that.http.get("/api/rainbow/authentication/v1.0/validator", that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + "(checkRESTAuthentication) REST authentication authenticationValidator : ", authenticationValidator);
            if (authenticationValidator.status==="OK") {
                authStatus = true;
            }
        } catch (err) {
            that._logger.log(that.DEBUG, LOG_ID + "(checkRESTAuthentication) REST authentication check authenticationValidator failed : ", err);
            authStatus = false;
        }

        return authStatus;
    }

    attemptToReconnect(reconnectDelay, currentAttempt) {
        let that = this;
        if (!that.reconnectInProgress) {
            that._logger.log(that.INFO, LOG_ID + "(attemptToReconnect) set reconnectInProgress for the currentAttempt : ", currentAttempt);
            that.reconnectInProgress = true;
            that._logger.log(that.INFO, LOG_ID + "(attemptToReconnect) Next attempt in " + that.reconnectDelay + " ms, this.currentAttempt : ", currentAttempt);
            that.timeOutManager.setTimeout(() => {
                that.checkPortalHealth(currentAttempt).then(() => {
                    //that._logger.log(that.DEBUG, LOG_ID + "(attemptToReconnect) Attempt succeeded!");
                    that._logger.log(that.INFO, LOG_ID + "(attemptToReconnect) reset reconnectInProgress after succeeded for the currentAttempt : ", currentAttempt);
                    that.reconnectInProgress = false;
                    that.eventEmitter.emit("attempt_succeeded");
                }).catch((err) => {
                    that._logger.log(that.INFO, LOG_ID + "(attemptToReconnect) Attempt failed! send attempt_failed for the currentAttempt : ", currentAttempt);
                    that._logger.log(that.INFO, LOG_ID + "(attemptToReconnect) reset reconnectInProgress after failed for the currentAttempt : ", currentAttempt);
                    that.reconnectInProgress = false;
                    that.eventEmitter.emit("attempt_failed");
                });
            }, reconnectDelay, "attemptToReconnect");
        } else {
            that._logger.log(that.DEBUG, LOG_ID + "(attemptToReconnect) reconnect in progress, so ignore this call for this.currentAttempt : ", currentAttempt);
        }
    }

    get_attempt_succeeded_callback(resolve?) {
        let that = this;
        //that._logger.log(that.DEBUG, LOG_ID + "(reconnect) get_attempt_succeeded_callback");
        that.attempt_promise_resolver.resolve = resolve;
        if (!that.attempt_succeeded_callback) {
            that._logger.log(that.DEBUG, LOG_ID + "(reconnect) get_attempt_succeeded_callback create the singleton of attempt_succeeded_callback method");
            that.attempt_succeeded_callback = function fn_attempt_succeeded_callback() { // attempt_succeeded_callback
                that._logger.log(that.INFO, LOG_ID + "(reconnect) attempt_succeeded_callback reconnection attempt successfull!");
                that.fibonacciStrategy.reset();
                //that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                if (that.attempt_promise_resolver.resolve) {
                    that.attempt_promise_resolver.resolve(undefined);
                } else {
                    that._logger.log(that.ERROR, LOG_ID + "(reconnect) attempt_succeeded_callback resolve is not define !");
                }
            };
        }
        return that.attempt_succeeded_callback;
    }

    get_attempt_failed_callback(reject?) {
        let that = this;
        that.attempt_promise_resolver.reject = reject;
        that._logger.log(that.DEBUG, LOG_ID + "(reconnect) get_attempt_failed_callback called.");
        if (!that.attempt_failed_callback) {
            that._logger.log(that.DEBUG, LOG_ID + "(reconnect) get_attempt_failed_callback create the singleton of attempt_failed_callback method");
            that.attempt_failed_callback = function fn_attempt_failed_callback() { // attempt_failed_callback
                //that.attempt_failed_callback = async () => { // attempt_failed_callback
                that._logger.log(that.INFO, LOG_ID + "(reconnect) fn_attempt_failed_callback attempt #" + that.currentAttempt + " has failed!");
                that.currentAttempt++;
                if (that.currentAttempt < that.maxAttemptToReconnect) {
                    that.reconnectDelay = that.fibonacciStrategy.next();
                    //await that.attemptToReconnect(that.reconnectDelay);
                    that._logger.log(that.DEBUG, LOG_ID + "(reconnect) fn_attempt_failed_callback attempt #" + that.currentAttempt + " will call attemptToReconnect.");
                    that.attemptToReconnect(that.reconnectDelay, that.currentAttempt);
                } else {
                    if (that.attempt_promise_resolver.reject) {
                        that.attempt_promise_resolver.reject();
                    } else {
                        that._logger.log(that.ERROR, LOG_ID + "(reconnect) fn_attempt_failed_callback reject is not define !");
                    }
                }
            };
        } else {
            that._logger.log(that.DEBUG, LOG_ID + "(reconnect) get_attempt_failed_callback that.attempt_failed_callback method already defined, so return it.");
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
            return Promise.reject({"errorname": "reconnectingInProgress", "label": "reconnect already in progress"});
        }
    }

    //endregion Check Connection

    //region S2S
    // ************* S2S **************************

    async listConnectionsS2S(): Promise<any> {
        let that = this;
        //that._logger.log(that.INTERNAL, LOG_ID + "(listConnectionsS2S) S2S");
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(listConnectionsS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(listConnectionsS2S) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(listConnectionsS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(listConnectionsS2S) error : ", err);
                return reject(err);
            });
        });
    }

    async sendS2SPresence(obj): Promise<any> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) Set S2S presence : ", obj);
        return new Promise(function (resolve, reject) {

            let data = obj ? {presence: {show: obj.show, status: obj.status}}:{presence: {show: "", status: ""}};
            if (!that.connectionS2SInfo || !that.connectionS2SInfo.id) {
                that._logger.log(that.ERROR, LOG_ID, "(sendS2SPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SPresence) error connectionS2SInfo.id is not defined.");
                return reject({code: -1, label: "connectionS2SInfo.id is not defined!!!"});
            }

            that.http.put("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/presences", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SPresence) successfull.");
                json = json ? json:{};
                that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendS2SPresence) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SPresence) error : ", err);
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

    async deleteConnectionsS2S(connexions): Promise<any> {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S");
        that._logger.log(that.INFO, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S : ", connexions);
        const requests = [];
        connexions.forEach(cnx => requests.push(
                that.http.delete("/api/rainbow/ucs/v1.0/connections/" + cnx.id, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteConnectionsS2S) REST result : ", json);
                    return json?.data;
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteConnectionsS2S) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteConnectionsS2S) error : ", err);
                    return err;
                })
                )
        );
        return Promise.all(connexions)
                .then(response => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) all successfull");
                    //console.log("it worked");
                    //console.log( response.data )
                    //connectionInfo = response.data.data
                    //process.exit()
                    return response
                })
    }

    async loginS2S(callback_url): Promise<any> {
        let that = this;
        let data = {connection: { /*resource: "s2s_machin",*/  callback_url}};
        that._logger.log(that.DEBUG, LOG_ID + "(loginS2S)  will login  S2S.");
        that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) will login S2S : ", data);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.INFO, LOG_ID + "(loginS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) REST result : ", json);
                that.connectionS2SInfo = json?.data;
                resolve(that.connectionS2SInfo);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(loginS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(loginS2S) error : ", err);
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


    async infoS2S(s2sConnectionId): Promise<any> {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(infoS2S)  will get info S2S");
        that._logger.log(that.INTERNAL, LOG_ID + "(infoS2S) will get info S2S");
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + s2sConnectionId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(infoS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(infoS2S) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(infoS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(infoS2S) error : ", err);
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

    async setS2SConnection(connectionId): Promise<any> {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(setS2SConnection)  will get info S2S and save the session infos.");
        that._logger.log(that.INTERNAL, LOG_ID + "(setS2SConnection) will get info S2S and save the session infos.");
        return that.connectionS2SInfo = await that.infoS2S(connectionId);
    }

    async sendS2SMessageInConversation(conversationId, msg): Promise<any> {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!msg) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SMessageInConversation) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SMessageInConversation) No msg provided");
                resolve(null);
            } else {
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId + "/messages", that.getRequestHeader(), msg, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendS2SMessageInConversation) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SMessageInConversation) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(sendS2SMessageInConversation) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SMessageInConversation) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getS2SServerConversation(conversationId): Promise<any> {
        let that = this;
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getS2SServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getS2SServerConversation) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getS2SServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getS2SServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    async checkS2Sconnection(): Promise<any> {
        let that = this;
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        return new Promise((resolve, reject) => {
            if (!that.connectionS2SInfo) {
                return reject({message: "connectionS2SInfo is not defined"});
            }
            that.http.head("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkS2Sconnection) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkS2Sconnection) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkS2Sconnection) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkS2Sconnection) error : ", err);
                return reject(err);
            });
        });
    }

    async checkS2SAuthentication(): Promise<boolean> {
        let that = this;
        //that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) .");
        let authStatus = false;

        try {
            let authenticationValidator = await that.checkS2Sconnection();
            that._logger.log(that.DEBUG, LOG_ID + "(checkS2SAuthentication) S2S authentication authenticationValidator : ", authenticationValidator);
            if (authenticationValidator.id) {
                authStatus = true;
            }
        } catch (err) {
            that._logger.log(that.DEBUG, LOG_ID + "(checkS2SAuthentication) S2S authentication check authenticationValidator failed : ", err);
            authStatus = false;
        }

        return authStatus;
    }

    /**
     *
     * @param roomid
     * @param {string} role Enum: "member" "moderator" of your role in this room

     */
    async joinS2SRoom(roomid, role: ROOMROLE): Promise<any> {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/rooms/{roomId}/join
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!roomid) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinS2SRoom) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(joinS2SRoom) No roomid provided");
                reject({code: -1, label: "roomid is not defined!!!"});
            } else {
                let data = undefined; /*{
                    "role": role
                }; // */
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/rooms/" + roomid + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(joinS2SRoom) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(joinS2SRoom) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(joinS2SRoom) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(joinS2SRoom) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion

    //region IMS

    retrieveXMPPMessagesByListOfMessageIds(ims: Array<any>) {
        // API https://api.openrainbow.org/enduser/#api-ims
        // POST /api/rainbow/enduser/v1.0/users/:userId/ims
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/ims";
            let param = {
                "ims": ims
            };
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) REST ims : ", ims);

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveXMPPMessagesByListOfMessageIds) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveXMPPMessagesByListOfMessageIds) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion IMS

    //region Messages

    showAllMatchingMessagesForAPeer(userId: string, substring: string, peer: string, isRoom: boolean = undefined, limit: number = 20) {
        // GET /api/rainbow/enduser/v1.0/users/:userId/conversations/search/hits
        // API https://api.openrainbow.org/enduser/#api-conversations-searchTextInConversation
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/search/hits";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "substring", substring);
            addParamToUrl(urlParamsTab, "peer", peer);
            addParamToUrl(urlParamsTab, "isRoom", isRoom);
            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(showAllMatchingMessagesForAPeer) REST success.");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(showAllMatchingMessagesForAPeer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(showAllMatchingMessagesForAPeer) error : ", err);
                return reject(err);
            });
        });
    }


    markMessageAsRead(conversationId, messageId) {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages/{id}/read
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!conversationId) {
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) No conversationId provided");
                reject({code: -1, label: "conversationId is not defined!!!"});
            } else if (!messageId) {
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) No messageId provided");
                reject({code: -1, label: "messageId is not defined!!!"});
            } else {
                that.http.put("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId + "/messages/" + messageId + "/read", that.getRequestHeader(), {}, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(markMessageAsRead) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(markMessageAsRead) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Messages

    //region Public url

    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent ?: boolean, language ?: string): Promise<any> {
        // GET /api/rainbow/enduser/v1.0/rooms/:roomId/public-links
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomIdPublicLinks
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getABubblePublicLinkAsModerator) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/public-links";
            if (bubbleId===undefined) {
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblePublicLinkAsModerator) bad request paramater bubbleId undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (emailContent!=undefined) {
                addParamToUrl(urlParamsTab, "emailContent", emailContent);
            }
            if (language!=undefined) {
                addParamToUrl(urlParamsTab, "language", language);
            }
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblePublicLinkAsModerator) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABubblePublicLinkAsModerator) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblePublicLinkAsModerator) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABubblePublicLinkAsModerator) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABubblePublicLinkAsModerator) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     *
     * @param {string} userId id of to get all openInviteId belonging to this user. If not setted the connected user is used.
     * @param {string} type type optionnel to get the public link of personal rooms type query parameter used with personal_audio_room or personal_video_room or default.
     * @param {string} roomId id optionnel to get the public link for a given roomId, managed by the userId roomId
     * @return {Promise<any>}
     */
    getAllOpenInviteIdPerRoomOfAUser(userId?: string, type?: string, roomId?: string): Promise<Array<any>> {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) REST.");
            let userIdFilter = userId ? userId:that.userId;
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
                if (requestParam=="") {
                    requestParam += "?";
                } else {
                    requestParam += "+";
                }
                requestParam += "type=" + type;
            }
            if (roomId) {
                if (requestParam=="") {
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
                that._logger.log(that.DEBUG, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) -- " + userIdFilter + " -- success");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error : ", err);
                return reject(err);
            });
        });
    };

    generateNewPublicUrl(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId": bubbleId
            };
            that._logger.log(that.INTERNAL, LOG_ID + "(generateNewPublicUrl) REST.");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/reset", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(generateNewPublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(generateNewPublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(generateNewPublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(generateNewPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    removePublicUrl(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId": bubbleId
            };
            that._logger.log(that.INTERNAL, LOG_ID + "(removePublicUrl) REST.");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/unbind", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(removePublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removePublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removePublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removePublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    createPublicUrl(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId": bubbleId
            };
            that._logger.log(that.INTERNAL, LOG_ID + "(createPublicUrl) REST bubbleId : ", bubbleId, " param : ", param);

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/bind", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createPublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    registerGuest(guest: GuestParams) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(registerGuest) REST.");

            that.http.post("/api/rainbow/enduser/v1.0/users/self-register", that.getRequestHeader(), guest.getUrlParam(), undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(registerGuest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerGuest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerGuest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerGuest) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Public url

    //region Bubble Open Invites

    checkOpenInviteIdValidity(openInviteId: string) {
        // GET /api/rainbow/enduser/v1.0/rooms/open-invites/validate
        // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-checkRoomInvitationUsingOpenInviteiId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(checkOpenInviteIdValidity) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/rooms/open-invites/validate";
            if (openInviteId===undefined) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkOpenInviteIdValidity) bad request paramater openInviteId undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "openInviteId", openInviteId);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkOpenInviteIdValidity) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkOpenInviteIdValidity) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(checkOpenInviteIdValidity) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkOpenInviteIdValidity) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkOpenInviteIdValidity) error : ", err);
                return reject(err);
            });
        });
    }

    joinBubbleByOpenInviteId(openInviteId: string) {
        // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-sendJoinRoomInvitationUsingOpenInviteiId
        // POST /api/rainbow/enduser/v1.0/rooms/open-invites
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {
                openInviteId //, // Id 
            };

            that._logger.log(that.INTERNAL, LOG_ID + "(joinBubbleByOpenInviteId) REST params : ", params);

            that.http.post("/api/rainbow/enduser/v1.0/rooms/open-invites", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(joinBubbleByOpenInviteId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinBubbleByOpenInviteId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinBubbleByOpenInviteId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinBubbleByOpenInviteId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubble Open Invites

    //region Conference

    /*    askConferenceSnapshot(conferenceId : string, type : MEDIATYPE, limit : number = 100, offset : number = 0) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(askConferenceSnapshot) REST params : ", params);
            that.http.get("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/snapshot?mediaType=" + type + "&limit=" + limit + "&offset=" + offset, that.getRequestHeader(), params).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(askConferenceSnapshot) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(askConferenceSnapshot) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(askConferenceSnapshot) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(askConferenceSnapshot) error : ", err);
                return reject(err);
            });
        });
    } 
    // */
    retrieveAllConferences(scheduled) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllConferences) REST params : ", params);
            let url = "/api/rainbow/confprovisioning/v1.0/conferences?";
            if (scheduled!=undefined) {
                url += "scheduled=" + scheduled;
            }
            url += "&format=full&userId=" + that.userId;

            that.http.get(url, that.getRequestHeader(), params).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllConferences) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllConferences) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllConferences) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllConferences) error : ", err);
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
        that._logger.log(that.DEBUG, LOG_ID + "(retrieveWebConferences) with mediaType=" + mediaType);
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
                                that._logger.log(that.DEBUG, LOG_ID + "(retrieveWebConferences) successfully");
                                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveWebConferences) REST result : ", conferencesProvisionData);
                                resolve(conferencesProvisionData.data);
                            },
                            (response) => {
                                let msg = response.data ? response.data.errorDetails:response.data;
                                let errorMessage = "(retrieveWebConferences) failure: " + msg;
                                that._logger.log(that.ERROR, LOG_ID + "(retrieveWebConferences) error : " + errorMessage);
                                reject(new Error(errorMessage));
                            });
        });
    };

    //endregion conference

    //region Offers and subscriptions
    retrieveAllCompanyOffers(companyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanyOffers) REST companyId : ", companyId);

            that.http.get("/api/rainbow/subscription/v1.0/companies/" + companyId + "/offers", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllCompanyOffers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanyOffers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllCompanyOffers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllCompanyOffers) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveAllCompanySubscriptions(companyId: string, format: string = "small") {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST companyId : ", companyId);

            let url: string = "/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllCompanySubscriptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllCompanySubscriptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllCompanySubscriptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllCompanySubscriptions) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean) {
        let that = this;
        // /api/rainbow/subscription/v1.0/companies/:companyId/subscriptions
        return new Promise(function (resolve, reject) {
            let params: any = {
                offerId //, // Id of the offer to subscribe.
                // maxNumberUsers :     integer, // optionnel Number of users (licences) bought for this offer. Possible values : 1..
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            if (maxNumberUsers!=undefined) {
                params.maxNumberUsers = maxNumberUsers;
            }

            if (autoRenew!=undefined) {
                params.autoRenew = autoRenew;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(subscribeCompanyToOffer) REST params : ", params);

            that.http.post("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeCompanyToOffer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeCompanyToOffer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeCompanyToOffer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeCompanyToOffer) error : ", err);
                return reject(err);
            });
        });
    }

    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string) {
        let that = this;
// /api/rainbow/subscription/v1.0/companies/:companyId/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeCompanyToOffer) REST companyId : ", companyId + ", subscriptionId : ", subscriptionId);

            that.http.delete("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unSubscribeCompanyToOffer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeCompanyToOffer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unSubscribeCompanyToOffer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unSubscribeCompanyToOffer) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeUserToSubscription(userId: string, subscriptionId: string) {
        let that = this;
        // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            let params: any = {
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            that._logger.log(that.INTERNAL, LOG_ID + "(subscribeUserToSubscription) REST params : ", params);

            that.http.post("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeUserToSubscription) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeUserToSubscription) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeUserToSubscription) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    unSubscribeUserToSubscription(userId: string, subscriptionId: string) {
        let that = this;
        // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            let params: any = {
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeUserToSubscription) REST params : ", params);

            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unSubscribeUserToSubscription) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unSubscribeUserToSubscription) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unSubscribeUserToSubscription) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unSubscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    getAUserProfiles(userId: string) {
        // API https://api.openrainbow.org/admin/#api-users_profiles-admin_users_GetUserProfiles 
        // GET /api/rainbow/admin/v1.0/users/:userId/profiles
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST userId : ", userId);

            let url: string = "/api/rainbow/admin/v1.0/users/" + userId + "/profiles";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAUserProfiles) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfiles) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAUserProfiles) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAUserProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    getAUserProfilesFeaturesByUserId(userId: string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + userId + "/profiles/features", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAUserProfilesFeaturesByUserId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAUserProfilesFeaturesByUserId) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAUserProfilesFeaturesByUserId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAUserProfilesFeaturesByUserId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Offers and subscriptions

    //region Bubbles Tags
    retrieveAllBubblesByTags(tags: Array<string>, format: string = "small", nbUsersToKeep: number = 100) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllBubblesByTags) REST companyId : ", tags);
            let nbTags = tags.length;
            let tagParams = "";
            if (nbTags==0) {
                let err = {
                    "label": "retrieveAllBubblesByTags : No tags provided for filter the bubbles."
                };
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllBubblesByTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            }
            if (nbTags==1) {
                tagParams = "tag=" + encodeURI(tags[0]) + "&";
            }
            if (nbTags > 1) {
                for (let id = 0; id < nbTags; id++) {
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
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllBubblesByTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllBubblesByTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllBubblesByTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     *
     * @param {string} roomId
     * @param {Array<any>} tags : tags    Object[]
     List of objects. Empty to reset the list
     tag    String Tag name
     color optionnel String Tag color - Hex Color in "0x" or "#" prefixed or "non-prefixed"
     emoji optionnel String Tag emoji - an unicode sequence
     * @return {Promise<unknown>}
     */
    setTagsOnABubble(roomId: string, tags: Array<string>) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {"tags": tags};
            that._logger.log(that.INTERNAL, LOG_ID + "(setTagsOnABubble) REST params : ", params);

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/tags", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(setTagsOnABubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setTagsOnABubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setTagsOnABubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setTagsOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTagOnABubble(roomIds: Array<string>, tag: string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            let params: any = {
                "tag": tag,
                "rooms": roomIds
            };

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) REST params : ", params);

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/tags", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTagOnABubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTagOnABubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTagOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubbles Tags

    //region Bubbles - dialIn

    disableDialInForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-DisableDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/disable

        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/disable";
            let params = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(disableDialInForARoom) REST params : ", params);

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(disableDialInForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(disableDialInForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(disableDialInForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disableDialInForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    enableDialInForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-EnableDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/enable

        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/enable";
            let params = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(enableDialInForARoom) REST params : ", params);

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(enableDialInForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableDialInForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableDialInForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableDialInForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    resetDialInCodeForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-ResetDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/reset

        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/reset";
            let params = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(resetDialInCodeForARoom) REST params : ", params);

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(resetDialInCodeForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resetDialInCodeForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resetDialInCodeForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resetDialInCodeForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    getDialInPhoneNumbersList(shortList: boolean) {
        // API https://api.openrainbow.org/enduser/#api-dial_in_phone_numbers-GetDialInPhoneNumbers 
        // GET /api/rainbow/enduser/v1.0/rooms/dial-in/phone-numbers
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) REST shortList : ", shortList);

            let url: string = "/api/rainbow/enduser/v1.0/rooms/dial-in/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "shortList", shortList);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDialInPhoneNumbersList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDialInPhoneNumbersList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDialInPhoneNumbersList) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubbles - dialIn

    //region Alerts - Notifications

    createDevice(data: Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createDevice) REST bubble created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createDevice) error : ", err);
                return reject(err);
            });
        });
    }

    updateDevice(deviceId, params: Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateDevice) REST bubble created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateDevice) error : ", err);
                return reject(err);
            });
        });
    }

    deleteDevice(deviceId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevice) REST deviceId : ", deviceId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevice(deviceId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getDevice) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number, limit: number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId;
            }

            if (userId) {
                getParams += getParams ? "&":"?";
                getParams += "userId=" + userId;
            }

            if (deviceName) {
                getParams += getParams ? "&":"?";
                getParams += "name=" + deviceName;
            }

            if (type) {
                getParams += getParams ? "&":"?";
                getParams += "type=" + type;
            }

            if (tag) {
                getParams += getParams ? "&":"?";
                getParams += "tags=" + tag;
            }

            getParams += getParams ? "&":"?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&":"?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&":"?";
            getParams += "format=" + "full";

            that._logger.log(that.INTERNAL, LOG_ID + "(getDevices) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevices) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevices) error : ", err);
                return reject(err);
            });
        });
    }

    getDevicesTags(companyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getDevicesTags) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/tags" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevicesTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @method renameDevicesTags
     * @param {string} tag    tag to rename.
     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. <br>
     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
     * @param {string} newTagName New tag name. (Body Parameters)
     * @description
     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
     */
    renameDevicesTags(newTagName: string, tag: string, companyId: string) {
        // - Rename a tag for all assigned devices PUT /api/rainbow/notificationsadmin/v1.0/devices/tags
        // Example: PUT https://openrainbow.com/api/rainbow/notificationsadmin/v1.0/devices/tags?tag=1rst%20floor&companyId=5703d0d49ccf39843c7ef897

        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId; //? companyId : that.account.companyId;
            }

            if (tag) {
                getParams += getParams ? "&":"?";
                getParams += "tag=" + tag;
            }

            let params = {newTagName};

            that.http.put(url + getParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(renameDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renameDevicesTags) REST bubble created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renameDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renameDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @method deleteDevicesTags
     * @param {string} tag    tag to rename.
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
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevicesTags) REST tag : ", tag);
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId;//? companyId : that.account.companyId;
            }

            if (tag) {
                getParams += getParams ? "&":"?";
                getParams += "tag=" + tag;
            }

            that.http.delete(url + getParams, that.getPostHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevicesTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDevicesTags) error : ", err);
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
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId;//? companyId : that.account.companyId;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getstatsTags) REST companyId : ", companyId);

            that.http.get(url + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getstatsTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getstatsTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getstatsTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getstatsTags) error : ", err);
                return reject(err);
            });
        });
    }

    createTemplate(data: Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/templates", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createTemplate) REST bubble created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateTemplate(templateId, params: Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTemplate) REST bubble created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTemplate(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTemplate) REST templateId : ", templateId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplate(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getTemplate) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplates(companyId: string, offset: number, limit: number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&":"?";
                getParams += "companyId=" + companyId;
            }

            getParams += getParams ? "&":"?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&":"?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&":"?";
            getParams += "format=" + "full";

            that._logger.log(that.INTERNAL, LOG_ID + "(getTemplates) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTemplates) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createFilter(data: Object) {
        // /api/rainbow/notificationsadmin/v1.0/filters

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/filters", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createFilter) REST created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createFilter) error : ", err);
                return reject(err);
            });
        });
    }

    updateFilter(FilterId, params: Object) {
        // /api/rainbow/notificationsadmin/v1.0/filters

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateFilter) REST created : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateFilter) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFilter(FilterId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteFilter) REST FilterId : ", FilterId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilter(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getFilter) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters/" + templateId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilters(offset: number, limit: number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            let getParams = "";

            getParams += getParams ? "&":"?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&":"?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&":"?";
            getParams += "format=" + "full";

            that._logger.log(that.INTERNAL, LOG_ID + "(getFilters) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFilters) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFilters) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFilters) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFilters) error : ", err);
                return reject(err);
            });
        });
    }

    createAlert(data: Object) {
        // /api/rainbow/notifications/v1.0/notifications

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notifications/v1.0/notifications", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAlert) error : ", err);
                return reject(err);
            });
        });
    }

    updateAlert(AlertId, params: Object) {
        // /api/rainbow/notifications/v1.0/notifications

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notifications/v1.0/notifications/" + AlertId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAlert) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAlert(AlertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAlert) REST AlertId : ", AlertId);

            that.http.delete("/api/rainbow/notifications/v1.0/notifications/" + AlertId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlert(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getAlert) REST params : ", params);

            that.http.get("/api/rainbow/notifications/v1.0/notifications/" + alertId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlerts(offset: number, limit: number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            let getParams = "";

            getParams += getParams ? "&":"?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&":"?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&":"?";
            getParams += "format=" + "full";

            that._logger.log(that.INTERNAL, LOG_ID + "(getAlerts) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notifications/v1.0/notifications" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlerts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlerts) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlerts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlerts) error : ", err);
                return reject(err);
            });
        });
    }

    sendAlertFeedback(alertId: string, data: Object) {
        // /api/rainbow/notifications/v1.0/feedback

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notifications/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendAlertFeedback) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendAlertFeedback) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendAlertFeedback) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendAlertFeedback) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForAnAlert(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/feedback
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForAnAlert) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertFeedbackSentForAnAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForAnAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertFeedbackSentForAnAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertFeedbackSentForAnAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback/stats
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback/stats", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getReportSummary(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getReportSummary) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/summary", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportSummary) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportSummary) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportSummary) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportSummary) error : ", err);
                return reject(err);
            });
        });
    }

    getReportDetails(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getReportDetails) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/details", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportDetails) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportDetails) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportDetails) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportDetails) error : ", err);
                return reject(err);
            });
        });
    }

    getReportComplete(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/reports/complete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getReportComplete) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/complete", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportComplete) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportComplete) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportComplete) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportComplete) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion

    //region calendar

    getCalendarState() {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarState) REST params : ", params);

            that.http.get("/api/rainbow/calendar/v1.0", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarState) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarStates(users: Array<string> = [undefined]) {
        // /api/rainbow/calendar/v1.0/states
        let that = this;

        let params = {
            users
        };

        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/calendar/v1.0/states", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarStates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarStates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarStates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarStates) error : ", err);
                return reject(err);
            });
        });
    }

    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string) {
        // /api/rainbow/calendar/v1.0/register
        let that = this;

        let params = {
            type,
            redirect,
            callback: callbackUrl
        };

        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/calendar/v1.0/register", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCalendarRegister) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCalendarRegister) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCalendarRegister) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCalendarRegister) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarAutomaticReplyStatus(userid?: string) {
        // /api/rainbow/calendar/v1.0/automatic_reply
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/calendar/v1.0/automatic_reply";
            if (userid) {
                url += "?userid =" + userid;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getReportDetails) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarAutomaticReplyStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarAutomaticReplyStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarAutomaticReplyStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarAutomaticReplyStatus) error : ", err);
                return reject(err);
            });
        });
    }

    // @deprecated 
    enableOrNotCalendar(disable: boolean) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {
                disable
            };

            that._logger.log(that.INTERNAL, LOG_ID + "(enableOrNotCalendar) REST params : ", params);

            that.http.patch("/api/rainbow/calendar/v1.0", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(enableOrNotCalendar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableOrNotCalendar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableOrNotCalendar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableOrNotCalendar) error : ", err);
                return reject(err);
            });
        });
    }

    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string) {
        // API https://api.openrainbow.org/calendar/#api-Calendar-ControlCalendar
        // PUT /api/rainbow/calendar/v1.0/control

        let that = this;
        return new Promise(function (resolve, reject) {
            let that = this;
            let urlParams = "/api/rainbow/calendar/v1.0/control";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(urlParams);
            addParamToUrl(urlParamsTab, "disable", disable);
            addParamToUrl(urlParamsTab, "ignore", ignore);
            urlParams = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(controlCalendarOrIgnoreAnEntry) REST url : ", urlParams);

            let params = {};

            that.http.put(urlParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(controlCalendarOrIgnoreAnEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(controlCalendarOrIgnoreAnEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(controlCalendarOrIgnoreAnEntry) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(controlCalendarOrIgnoreAnEntry) error : ", err);
                return reject(err);
            });
        });
    }

    unregisterCalendar() {
        // DELETE /api/rainbow/calendar/v1.0
        // API https://api.openrainbow.org/calendar/#api-Calendar-UnregisterCalendar
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST ");

            that.http.delete("/api/rainbow/calendar/v1.0", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAnImportStatusReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAnImportStatusReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion

    //region MSTeams

    controlMsteamsPresence(disable?: boolean, ignore?: string) {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-ControlPresence
        // PUT /api/rainbow/msteamspresence/v1.0/control

        let that = this;
        return new Promise(function (resolve, reject) {
            let that = this;
            let urlParams = "/api/rainbow/msteamspresence/v1.0/control";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(urlParams);
            addParamToUrl(urlParamsTab, "disable", disable);
            addParamToUrl(urlParamsTab, "ignore", ignore);
            urlParams = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(controlMsteamsPresence) REST url : ", urlParams);

            let params = {};

            that.http.put(urlParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(controlMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(controlMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(controlMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(controlMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    getMsteamsPresenceState(userId: string) {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-GetPresence
        // GET /api/rainbow/msteamspresence/v1.0 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/msteamspresence/v1.0";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "userid", userId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMsteamsPresenceState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMsteamsPresenceState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMsteamsPresenceState) error : ", err);
                return reject(err);
            });
        });
    }

    getMsteamsPresenceStates(users: Array<string> = []) {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-GetPresences
        // POST /api/rainbow/msteamspresence/v1.0/states
        let that = this;
        let urlParams = "/api/rainbow/msteamspresence/v1.0/states";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        //addParamToUrl(urlParamsTab, "users", users);
        urlParams = urlParamsTab[0];

        let data = {users};

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getMsteamsPresenceStates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceStates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMsteamsPresenceStates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMsteamsPresenceStates) error : ", err);
                return reject(err);
            });
        });
    }

    registerMsteamsPresenceSharing(redirect?: boolean, callback?: string) {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-registerPresence
        // POST /api/rainbow/msteamspresence/v1.0/register
        let that = this;
        let urlParams = "/api/rainbow/msteamspresence/v1.0/register";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        //addParamToUrl(urlParamsTab, "users", users);
        urlParams = urlParamsTab[0];

        let data = {redirect, callback};

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(registerMsteamsPresenceSharing) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerMsteamsPresenceSharing) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerMsteamsPresenceSharing) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerMsteamsPresenceSharing) error : ", err);
                return reject(err);
            });
        });
    }

    unregisterMsteamsPresenceSharing() {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-unregisterPresence
        // DELETE /api/rainbow/msteamspresence/v1.0
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(unregisterMsteamsPresenceSharing) REST.");

            that.http.delete("/api/rainbow/msteamspresence/v1.0", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unregisterMsteamsPresenceSharing) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unregisterMsteamsPresenceSharing) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unregisterMsteamsPresenceSharing) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unregisterMsteamsPresenceSharing) error : ", err);
                return reject(err);
            });
        });
    }

    activateMsteamsPresence() {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-activatePresence
        // POST /api/rainbow/msteamspresence/v1.0/activate
        let that = this;
        let urlParams = "/api/rainbow/msteamspresence/v1.0/activate";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        //addParamToUrl(urlParamsTab, "users", users);
        urlParams = urlParamsTab[0];

        let data = {};

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    deactivateMsteamsPresence() {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-deactivatePresence
        // DELETE /api/rainbow/msteamspresence/v1.0/activate
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(unregisterMsteamsPresenceSharing) REST.");

            that.http.delete("/api/rainbow/msteamspresence/v1.0/activate", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deactivateMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deactivateMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deactivateMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deactivateMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion MSTeams

    //region AD/LDAP
    //region AD/LDAP Massprovisioning

    checkCSVdata(data?: any, companyId?: string, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/check";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVdata) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdata) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVdata) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVdata) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAnImportStatusReport(reqId: string) {
        // DELETE /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-DeleteReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST reqId : ", reqId);

            that.http.delete("/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAnImportStatusReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAnImportStatusReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getAnImportStatusReport(reqId?: string, format: string = "full"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatusReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAnImportStatusReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAnImportStatusReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getAnImportStatus(companyId?: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/imports/:companyId
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-GetDirectoriesImportStatus
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/imports/" + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatus) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAnImportStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAnImportStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAnImportStatus) error : ", err);
                return reject(err);
            });
        });
    }

    getInformationOnImports(companyId?: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetImports
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInformationOnImports) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getInformationOnImports) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInformationOnImports) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInformationOnImports) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInformationOnImports) error : ", err);
                return reject(err);
            });
        });
    }

    getResultOfStartedOffice365TenantSynchronizationTask(tenant?: string, format: string = "json"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskGet
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVData(data?: any, companyId?: string, label: string = "none", noemails: boolean = true, nostrict: boolean = false, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-ImportCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports";
        let urlParamsTab: string[] = [];
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
                that._logger.log(that.DEBUG, LOG_ID + "(importCSVData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importCSVData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importCSVData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importCSVData) error : ", err);
                return reject(err);
            });
        });
    }

    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant?: string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskStart
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), {}, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    synchronizeOffice365TenantUserList(tenant?: string, format: string = "json"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronize/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenant
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronize/" + tenant;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeOffice365TenantUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(synchronizeOffice365TenantUserList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeOffice365TenantUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(synchronizeOffice365TenantUserList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(synchronizeOffice365TenantUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?: any, companyId?: string, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckRainbowVoiceCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error : ", err);
                return reject(err);
            });
        });
    }

    updateCommandIdStatus(data?: any, commandId?: string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/:commandId/report
        // API : 
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/" + commandId + "/report";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "companyId", companyId);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCommandIdStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCommandIdStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCommandIdStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCommandIdStatus) error : ", err);
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
    synchronizeUsersAndDeviceswithCSV(CSVTxt?: string, companyId?: string, label: string = undefined, noemails: boolean = true, nostrict: boolean = false, delimiter?: string, comment: string = "%", commandId?: string): Promise<{
        reqId: string,
        mode: string,
        status: string,
        userId: string,
        displayName: string,
        label: string,
        startTime: string
    }> {
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize";
        let urlParamsTab: string[] = [];
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
                that._logger.log(that.DEBUG, LOG_ID + "(synchronizeUsersAndDeviceswithCSV) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeUsersAndDeviceswithCSV) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error : ", err);
                return reject(err);
            });
        });
    }

    // A template can be retrieved from GET /api/rainbow/massprovisioning/v1.0/users/template?mode=useranddevice
    getCSVTemplate(companyId?: string, mode: string = "useranddevice", comment?: string): any {
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/template";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "mode", mode);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCSVTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCSVTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCSVTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCSVTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCSVTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    // A file can be checked with POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
    checkCSVforSynchronization(CSVTxt, companyId?: string, delimiter?: string, comment: string = "%", commandId?: string): any {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVforSynchronization) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), CSVTxt, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVforSynchronization) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVforSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVforSynchronization) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVforSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    getCheckCSVReport(commandId: string) {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetCheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/" + commandId + "/report";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            //addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCheckCSVReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCheckCSVReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCheckCSVReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCheckCSVReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCheckCSVReport) error : ", err);
                return reject(err);
            });
        });
    }

    importRainbowVoiceUsersWithCSVdata(companyId: string, label: string = null, noemails: boolean = true, nostrict: boolean = false, delimiter: string = null, comment: string = "%", csvData: string) {
        // POST  https://openrainbow.com/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice     
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-RainbowVoiceCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) companyId : ", companyId, ", label : ", label, ", noemails : ", noemails, ", nostrict : ", nostrict, ", delimiter : ", delimiter, ", comment : ", comment);
            let url = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            addParamToUrl(urlParamsTab, "noemails", noemails ? "true":"false");
            addParamToUrl(urlParamsTab, "nostrict", nostrict ? "true":"false");
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error : ", err);
                return reject(err);
            });
        });
    }

    /* The users already synchronized can be retrieved in csv format with the following API:
            GET /api/rainbow/massprovisioning/v1.0/users/synchronize?ldap_id=true&&format=csv
    the ldap_id field will allow to compare rainbow users and ldap users
    // */
    retrieveRainbowUserList(companyId?: string, format: string = "csv", ldap_id: boolean = true) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronize";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", String(ldap_id));
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveRainbowUserList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveRainbowUserList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveRainbowUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, csvData: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-CheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVdataForSynchronizeDirectory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVdataForSynchronizeDirectory) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeData
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId, ", label : ", label);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(importCSVdataForSynchronizeDirectory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importCSVdataForSynchronizeDirectory) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    getCSVReportByCommandId(commandId: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getCSVReportByCommandId) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCSVReportByCommandId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCSVReportByCommandId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    createCSVReportByCommandId(commandId: string, data: any) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";

            /*
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), data, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCSVReportByCommandId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCSVReportByCommandId) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveRainbowEntriesList(companyId: string, format: string, ldap_id: boolean): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/synchronize/
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-SynchronizeDirectories
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/synchronize";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", ldap_id);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowEntriesList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveRainbowEntriesList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowEntriesList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveRainbowEntriesList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveRainbowEntriesList) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Massprovisioning

    //region LDAP APIs to use:

    ActivateALdapConnectorUser(): Promise<{ id: string, companyId: string, loginEmail: string, password: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/activate

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/activate";
            that._logger.log(that.INTERNAL, LOG_ID + "(ActivateALdapConnectorUser) REST url : ", url);
            let CSVTxt = undefined;

            that.http.post(url, that.getRequestHeader(), CSVTxt, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(ActivateALdapConnectorUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ActivateALdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ActivateALdapConnectorUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ActivateALdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapConnector(ldapId: string): Promise<{ status: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdap
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!ldapId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapConnector) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteLdapConnector) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapConnector) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveAllLdapConnectorUsersData(companyId?: string, format: string = "small", limit: number = 100, offset: number = undefined, sortField: string = "displayName", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdap
        // GET /api/rainbow/admin/v1.0/connectors/ldaps

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", String(limit));
            addParamToUrl(urlParamsTab, "offset", String(offset));
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", String(sortOrder));
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllLdapConnectorUsersData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllLdapConnectorUsersData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllLdapConnectorUsersData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllLdapConnectorUsersData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllLdapConnectorUsersData) error : ", err);
                return reject(err);
            });
        });
    }

    sendCommandToLdapConnectorUser(ldapId: string, command: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-connectors-CommandLdap
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId/command

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId + "/command";
            that._logger.log(that.INTERNAL, LOG_ID + "(sendCommandToLdapConnectorUser) REST url : ", url);
            let data = {command};

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendCommandToLdapConnectorUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendCommandToLdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendCommandToLdapConnectorUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendCommandToLdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }

    createConfigurationForLdapConnector(companyId: string, settings: any, name: string, type: string = "ldap_config") {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapConfig
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/config

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            that._logger.log(that.INTERNAL, LOG_ID + "(createConfigurationForLdapConnector) REST url : ", url);
            let data: any = {companyId, settings, type};

            if (name) {
                data.name = name;
            }

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createConfigurationForLdapConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createConfigurationForLdapConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createConfigurationForLdapConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapConnectorConfig(ldapConfigId: string): Promise<{ status: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdapConfig
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!ldapConfigId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapConnectorConfig) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteLdapConnectorConfig) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapConnectorConfig) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveLdapConnectorConfig(companyId: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfig
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfig) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorConfig) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfig) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorConfig) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorConfig) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorConfigTemplate(type: string = "ldap_template") {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/template

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/template";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorConfigTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorConfigTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorConfigTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigTemplates() {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/templates

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/templates";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigs(companyId: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapConfigs
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/configs 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/configs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorAllConfigs) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigs) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorAllConfigs) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorAllConfigs) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfigById
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;
            /*
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error : ", err);
                return reject(err);
            });
        });
    }


    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean, name: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-PutLdapConfig
        // PUT /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateConfigurationForLdapConnector) REST url : ", url);
            let params: any = {strict, settings};
            if (name) {
                params.name = name;
            }

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConfigurationForLdapConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConfigurationForLdapConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateConfigurationForLdapConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    uploadLdapAvatar(binaryImgFile: string, contentType: string = "", ldapId : string = null) {
        // API https://api.openrainbow.org/admin/#api-connectors-uploadLdapAvatar
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/avatar

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/avatar" + (ldapId?"/"+ldapId:"");
            that._logger.log(that.INTERNAL, LOG_ID + "(createConfigurationForLdapConnector) REST url : ", url);
            let data: any = binaryImgFile;

            that.http.post(url, that.getRequestHeader(), data, contentType).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadLdapAvatar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadLdapAvatar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadLdapAvatar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadLdapAvatar) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapAvatar(ldapId : string = null) {
        // API https://api.openrainbow.org/admin/#api-connectors-deleteLdapAvatar
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/avatar

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/avatar" + (ldapId?"/"+ldapId:"")
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapConnectorConfig) REST result : " + json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteLdapConnectorConfig) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapConnectorConfig) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion LDAP APIs to use:

    //endregion AD/LDAP

    //region Connectors

    createListOfEventsForConnector(events : Array<{ eventId : string, level : string, category : string, operation : string, description : string, date : string}>) {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/events

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/events";
            that._logger.log(that.INTERNAL, LOG_ID + "(createListOfEventsForConnector) REST url : ", url);
            let data: any = { events };
            

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createListOfEventsForConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createListOfEventsForConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createListOfEventsForConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createListOfEventsForConnector) error : ", err);
                return reject(err);
            });
        });  
    }

    //endregion Connectors
    
    //region Rainbow Voice Communication Platform Provisioning
    // Server doc : https://hub.openrainbow.com/api/ngcpprovisioning/index.html#tag/Cloudpbx

    //region CloudPBX

    getCloudPbxById(systemId) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPbxById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPbxById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPbxById) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBX(systemId, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}
        let that = this;


        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBX) REST url : ", url);
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
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBX) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBX) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBX) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBX(systemId: string): Promise<{ status: string }> {
        // DELETE https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!systemId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteCloudPBX) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBX) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBX) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", "" + limit);
            addParamToUrl(urlParamsTab, "offset", "" + offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", "" + sortOrder);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPbxById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPbxById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPbxById) error : ", err);
                return reject(err);
            });
        });
    }

    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string) {
        // POST https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            that._logger.log(that.INTERNAL, LOG_ID + "(createACloudPBX) REST url : ", url);
            let param = {
                bpId,
                companyId,
                customSipHeader_1,
                customSipHeader_2,
                externalTrunkId,
                language,
                name,
                noReplyDelay,
                numberingDigits,
                numberingPrefix,
                outgoingPrefix,
                routeInternalCallsToPeer,
                siteId
            };

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createACloudPBX) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createACloudPBX) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createACloudPBX) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createACloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXCLIPolicyForOutboundCalls(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/cli-options
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: string) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/cli-options
        let that = this;


        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST url : ", url);
            let params = {
                policy
            };

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXlanguages(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/languages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/languages";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXlanguages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXlanguages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXlanguages) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXlanguages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXlanguages) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXDeviceModels(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/devicemodels
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devicemodels";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXDeviceModels) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXDeviceModels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXDeviceModels) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXDeviceModels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXDeviceModels) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXTrafficBarringOptions(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/barring-options
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXTrafficBarringOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXTrafficBarringOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXTrafficBarringOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXTrafficBarringOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXTrafficBarringOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/emergency-numbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion CloudPBX

    //region Companies Cloudpbx Groups (Rainbow Voice)

    createCloudPBXGroup(_companyId: string, huntingGroup: HuntingGroup) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PostCloudPbxGroup
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/groups
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId?_companyId : that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups";
            let data: any = huntingGroup;
            /*addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            // */

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addTask) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addTask) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXGroup (_companyId : string, groupId : string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-DeleteCloudPbxGroup
        // DELETE /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            that.http.delete(url, that.getRequestHeader()).then((response) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- failure -- ");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- failure -- ", err.message);
                return reject(err);
            });
        });
    }

    getCloudPBXGroup (_companyId : string, groupId : string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetCloudPbxGroup
        // GET /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            /* let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "category", category);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXGroup) error : ", err);
                return reject(err);
            });

        });
    }

    getAllCloudPBXGroups (_companyId?: string, sortField?: string, name?: string, shortNumber?: string, externalNumber?: string, memberId?: string, type?: string, limit?: number, offset?: number, sortOrder?: number) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroup
        // GET /api/rainbow/admin/v1.0/companies/:companyId/groups
        let that = this;
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups" ;
             let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // ?: string, ?: string, ?: string, ?: string, ?: string, ?: string, ?: number, ?: number,
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "externalNumber", externalNumber);
            addParamToUrl(urlParamsTab, "memberId", memberId);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXGroups) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCloudPBXGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCloudPBXGroups) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCloudPBXGroups) error : ", err);
                return reject(err);
            });

        });
    }

    getMembersOfCloudPBXGroups (_companyId?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, displayName?: string, internalNumber?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroupMembers
        // GET /api/rainbow/admin/v1.0/companies/:companyId/group-members
        let that = this;
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups-members" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // ?: string, ?: string, ?: string, ?: string, ?: string, ?: string, ?: number, ?: number,
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getMembersOfCloudPBXGroups) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMembersOfCloudPBXGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMembersOfCloudPBXGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMembersOfCloudPBXGroups) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMembersOfCloudPBXGroups) error : ", err);
                return reject(err);
            });

        });
    }

    updateCloudPBXGroup(_companyId?: string, groupId?: string, name?: string, policy?: "serial" | "parallel" | "circular", timeout?: number, externalNumberId?: string, isEmptyAllowed?: boolean, isDDIUpdateByManagerAllowed?: boolean,
                        members?: {
                            memberId: string,
                            roles?: ("manager" | "agent" | "leader" | "assistant")[],
                            status?: "active" | "idle"
                        }[]) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            let data: any = {};
            addPropertyToObj(data, "name", name, false);
            addPropertyToObj(data, "policy", policy, false);
            addPropertyToObj(data, "timeout", timeout, false);
            addPropertyToObj(data, "externalNumberId", externalNumberId, false);
            addPropertyToObj(data, "isEmptyAllowed", isEmptyAllowed, false);
            addPropertyToObj(data, "isDDIUpdateByManagerAllowed", isDDIUpdateByManagerAllowed, false);
            addPropertyToObj(data, "members", members, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXHuntingGroupAnalyticsConfiguration (_companyId?: string, groupId?: string, isManagersAllowedToSeeMembersAnalytics?: boolean) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutAnalyticsCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/analytic-settings
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            let data: any = {};
            addPropertyToObj(data, "isManagersAllowedToSeeMembersAnalytics", isManagersAllowedToSeeMembersAnalytics, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXHuntingGroupAnalyticsConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXHuntingGroupAnalyticsConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXHuntingGroupAnalyticsConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXHuntingGroupAnalyticsConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXHuntingGroupRecordingConfiguration (_companyId?: string, groupId?: string, recordingProfile?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutRecordingCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/recordings
        let that = this;
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId:that.account.companyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId + "/recordings";
            let data: any = {};
            addPropertyToObj(data, "recordingProfile", recordingProfile, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXHuntingGroupRecordingConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXHuntingGroupRecordingConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXHuntingGroupRecordingConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXHuntingGroupRecordingConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies Cloudpbx Groups (Rainbow Voice)

    //region Cloudpbx Devices

    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices";
            that._logger.log(that.INTERNAL, LOG_ID + "(CreateCloudPBXSIPDevice) REST url : ", url);
            let param = {description, deviceTypeId, macAddress};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(CreateCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(CreateCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(CreateCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(CreateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reset  

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/reset";
            that._logger.log(that.INTERNAL, LOG_ID + "(factoryResetCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(factoryResetCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(factoryResetCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(factoryResetCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(factoryResetCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPDeviceById(systemId: string, deviceId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId;
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPDeviceById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPDeviceById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPDeviceById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPDeviceById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPDeviceById) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string) {
        // PUT  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXSIPDevice) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = {
                description,
                macAddress
            };
            that.http.put("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXSIPDevice) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCloudPBXSIPDevice(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, assigned: boolean, phoneNumberId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "assigned", assigned + "");
            addParamToUrl(urlParamsTab, "phoneNumberId", phoneNumberId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXSIPDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/registrations/ 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/registrations";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error : ", err);
                return reject(err);
            });
        });
    }

    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug   

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/debug";
            that._logger.log(that.INTERNAL, LOG_ID + "(grantCloudPBXAccessToDebugSession) REST url : ", url);
            let param = {duration};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(grantCloudPBXAccessToDebugSession) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(grantCloudPBXAccessToDebugSession) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(grantCloudPBXAccessToDebugSession) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(grantCloudPBXAccessToDebugSession) error : ", err);
                return reject(err);
            });
        });
    }

    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug  
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/debug", that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    rebootCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reboot    

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/reboot";
            that._logger.log(that.INTERNAL, LOG_ID + "(rebootCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(rebootCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(rebootCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(rebootCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(rebootCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx Devices
    //region Cloudpbx Subscribers

    getCloudPBXSubscriber(systemId: string, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId;
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}   
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers   

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers";
            that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST url : ", url);
            let param = {
                login,
                password,
                shortNumber,
                userId
            };

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createCloudPBXSubscriberRainbowUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCloudPBXSubscriberRainbowUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCloudPBXSubscriberRainbowUser) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}   
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId;
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}    
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete(" /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/   
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/registrations/    
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/registrations";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices  
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = {
                deviceId,
                macAddress
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/cli-options     
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/cli-options";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSubscriberCLIOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSubscriberCLIOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSubscriberCLIOptions) error : ", err);
                return reject(err);
            });
        });
    }


    //endregion Cloudpbx Subscribers
    //region Cloudpbx Phone Numbers

    getCloudPBXUnassignedInternalPhonenumbers(systemId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/free      
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/free";
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error : ", err);
                return reject(err);
            });
        });
    }

    listCloudPBXDDINumbersAssociated(systemId: string, limit: number = 100, offset: number, sortField: string = "number", sortOrder: number = 1, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi       
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser + "");
            addParamToUrl(urlParamsTab, "isAssignedToGroup", isAssignedToGroup + "");
            addParamToUrl(urlParamsTab, "isAssignedToIVR", isAssignedToIVR + "");
            addParamToUrl(urlParamsTab, "isAssignedToAutoAttendant", isAssignedToAutoAttendant + "");
            addParamToUrl(urlParamsTab, "limit", isAssigned + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(listCloudPBXDDINumbersAssociated) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(listCloudPBXDDINumbersAssociated) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(listCloudPBXDDINumbersAssociated) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(listCloudPBXDDINumbersAssociated) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(listCloudPBXDDINumbersAssociated) error : ", err);
                return reject(err);
            });
        });
    }

    createCloudPBXDDINumber(systemId: string, number: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi   
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXDDINumber) systemId : ", systemId + ", number : ", number);
            let data = {
                number
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCloudPBXDDINumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXDDINumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCloudPBXDDINumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}     
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}    
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(associateCloudPBXDDINumber) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId, ", userId : ", userId);
            let data = {};
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(associateCloudPBXDDINumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(associateCloudPBXDDINumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(associateCloudPBXDDINumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(associateCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }

    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/default     
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(setCloudPBXDDIAsdefault) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId);
            let data = {};
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/default", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCloudPBXDDIAsdefault) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCloudPBXDDIAsdefault) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCloudPBXDDIAsdefault) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCloudPBXDDIAsdefault) error : ", err);
                return reject(err);
            });
        });
    }


    //endregion Cloudpbx Phone Numbers

    //region Cloudpbx SIP Trunk

    retrieveExternalSIPTrunkById(externalTrunkId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/{externalTrunkId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks/" + externalTrunkId;
            //addParamToUrl(url, "systemId", systemId);

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveExternalSIPTrunkById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveExternalSIPTrunkById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveExternalSIPTrunkById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveExternalSIPTrunkById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveExternalSIPTrunkById) error : ", err);
                return reject(err);
            });
        });
    }

    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/ 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrievelistExternalSIPTrunks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrievelistExternalSIPTrunks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrievelistExternalSIPTrunks) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrievelistExternalSIPTrunks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrievelistExternalSIPTrunks) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx SIP Trunk

    //endregion Rainbow Voice Communication Platform Provisioning 

    //region Rainbow Voice

    //region Rainbow Voice CLI Options

    retrieveAllAvailableCallLineIdentifications() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/cli-options";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            // addParamToUrl(urlParamsTab, "status", status);
            // addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveCurrentCallLineIdentification() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options/current 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/cli-options/current";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            // addParamToUrl(urlParamsTab, "status", status);
            // addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCurrentCallLineIdentification) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveCurrentCallLineIdentification) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCurrentCallLineIdentification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveCurrentCallLineIdentification) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveCurrentCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string) {
        // API https://api.openrainbow.org/voice/#api-CLI_Options-Set_CLI
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options 
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(setCurrentActiveCallLineIdentification) policy : ", policy + ", phoneNumberId : ", phoneNumberId);
            let data = {
                policy,
                phoneNumberId
            };

            that.http.put("/api/rainbow/voice/v1.0/cli-options", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCurrentActiveCallLineIdentification) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCurrentActiveCallLineIdentification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCurrentActiveCallLineIdentification) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCurrentActiveCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice CLI Options

    //region Rainbow Voice Cloud PBX group

    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-add_user_to_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addMemberToGroup) groupId : ", groupId + ", memberId : ", memberId + ", position : ", position + ", roles : ", roles + ", status : ", status);
            let data = {
                memberId,
                position,
                roles,
                status
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/members", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addMemberToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addMemberToGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addMemberToGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addMemberToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId      
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-DeleteGroupVoiceMessage
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/messages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate);
            addParamToUrl(urlParamsTab, "callerName", callerName);
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getVoiceMessagesAssociatedToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getVoiceMessagesAssociatedToGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getVoiceMessagesAssociatedToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    getGroupForwards(groupId: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getGroupForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getGroupForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroupForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getGroupForwards) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroupForwards) error : ", err);
                return reject(err);
            });
        });
    }

    getTheUserGroup(type: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Get_User_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getTheUserGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTheUserGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTheUserGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTheUserGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTheUserGroup) error : ", err);
                return reject(err);
            });
        });
    }

    joinAGroup(groupId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/join     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinAGroup) groupId : ", groupId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    joinAllGroups() {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/join     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinAllGroups) .");
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinAllGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinAllGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinAllGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAGroup(groupId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/leave     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveAGroup) groupId : ", groupId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(leaveAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(leaveAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(leaveAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAllGroups() {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/leave     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveAllGroups) .");
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/groups/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(leaveAllGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(leaveAllGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(leaveAllGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    removeMemberFromGroup(groupId: string, memberId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId      
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-remove_user_from_group
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/messages-summary 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupsMessagesSummary
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/groups/messages-summary";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*addParamToUrl(urlParamsTab, "limit", limit + "");
             // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error : ", err);
                return reject(err);
            });
        });
    }

    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroup
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId, ", externalNumberId : ", externalNumberId, ", isEmptyAllowed : ", isEmptyAllowed);
            let data = {
                externalNumberId,
                isEmptyAllowed
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-UpdateGroupVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId + ", messageId : ", messageId);
            let data = {
                read
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards/:callForwardType 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupForward) groupId : ", groupId + ", callForwardType : ", callForwardType);
            let data = {
                destinationType,
                "number": numberToForward,
                activate,
                noReplyDelay,
                managerIds,
                rvcpAutoAttendantId
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupForward) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupForward) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupForward) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupForward) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-update_member_inside_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupMember) groupId : ", groupId + ", memberId : ", memberId);
            let data = {
                position,
                roles,
                status
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupMember) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupMember) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupMember) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupMember) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Cloud PBX group    

    //region Rainbow Voice Deskphones

    activateDeactivateDND(activate: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(activateDeactivateDND) activate : ", activate);
            let data = undefined;
            that.http.put("/api/rainbow/voice/v1.0/deskphones/dnd?activate=" + activate, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateDeactivateDND) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateDeactivateDND) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateDeactivateDND) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateDeactivateDND) error : ", err);
                return reject(err);
            });
        });

    }

    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number, activated: boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards/:callForwardType
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Forward_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(configureAndActivateDeactivateForward) callForwardType : ", callForwardType);
            let data = {
                type,
                number,
                timeout,
                activated
            };
            that.http.put("/api/rainbow/voice/v1.0/deskphones/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(configureAndActivateDeactivateForward) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(configureAndActivateDeactivateForward) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(configureAndActivateDeactivateForward) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(configureAndActivateDeactivateForward) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveActiveForwards() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_active_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/forwards";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
             // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveActiveForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveActiveForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveActiveForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveActiveForwards) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveActiveForwards) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveDNDState() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/dnd";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
             // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveDNDState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveDNDState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveDNDState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveDNDState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveDNDState) error : ", err);
                return reject(err);
            });
        });
    }

    searchUsersGroupsContactsByName(displayName: string, limit: number) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/searchbyname     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Search_by_name
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/deskphones/searchbyname";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "limit", limit);
            // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsersGroupsContactsByName) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUsersGroupsContactsByName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUsersGroupsContactsByName) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUsersGroupsContactsByName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUsersGroupsContactsByName) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Deskphones

    //region Rainbow Voice Personal Routines    

    activatePersonalRoutine(routineId: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId/activate     
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Activate_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(activatePersonalRoutine) routineId : ", routineId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/personalroutines/" + routineId + "/activate", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activatePersonalRoutine) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activatePersonalRoutine) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activatePersonalRoutine) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activatePersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomPersonalRoutine(name: string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines     
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Create_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createCustomPersonalRoutine) name : ", name);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/personalroutines", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCustomPersonalRoutine) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCustomPersonalRoutine) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCustomPersonalRoutine) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCustomPersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCustomPersonalRoutine(routineId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId      
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Delete_PersonalRoutine
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/personalroutines/" + routineId;
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomPersonalRoutine) (" + routineId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getPersonalRoutineData(routineId: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/personalroutines/" + routineId;
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getPersonalRoutineData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPersonalRoutineData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPersonalRoutineData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPersonalRoutineData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPersonalRoutines(userId) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutines
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/personalroutines?userId=" + userId;
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPersonalRoutines) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPersonalRoutines) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPersonalRoutines) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPersonalRoutines) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPersonalRoutines) error : ", err);
                return reject(err);
            });
        });
    }

    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: { manage: boolean, value: string }, deviceMode: { manage: boolean, mode: string }, immediateCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, busyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, noreplyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string, noReplyDelay: number }, huntingGroups: { withdrawAll: boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Update_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updatePersonalRoutineData) routineId : ", routineId + ", name : ", name);
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
                that._logger.log(that.DEBUG, LOG_ID + "(updatePersonalRoutineData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePersonalRoutineData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatePersonalRoutineData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatePersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Personal Routines    

    //region Rainbow Voice Routing

    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/routing 
        // API https://api.openrainbow.org/voice/#api-Routing-Set_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(manageUserRoutingData) destinations : ", destinations + ", currentDeviceId : ", currentDeviceId);
            let data = {
                destinations,
                currentDeviceId
            };
            that.http.put("/api/rainbow/voice/v1.0/routing", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(manageUserRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(manageUserRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(manageUserRoutingData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(manageUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrievetransferRoutingData(calleeId: string, addresseeId ?: string, addresseePhoneNumber ?: string) {
        // GET    https://openrainbow.com/api/rainbow/voice/v1.0/transfer-routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Transfer_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/transfer-routing";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "calleeId", calleeId);
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId);
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber);
            /*addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrievetransferRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrievetransferRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrievetransferRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrievetransferRoutingData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrievetransferRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserRoutingData() {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/routing";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveUserRoutingData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveUserRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveUserRoutingData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Routing    

    //region Rainbow Voice Settings 

    retrieveVoiceUserSettings() {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/settings
        // API https://api.openrainbow.org/voice/#api-Settings-Get_settings
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/settings";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveVoiceUserSettings) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveVoiceUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveVoiceUserSettings) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveVoiceUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveVoiceUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Settings  

    //region Rainbow Voice Voice

    addParticipant3PCC(callId: string, callData: { callee: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/participants     
        // API https://api.openrainbow.org/voice/#api-Voice-Add_participant
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addParticipant3PCC) callId : ", callId, ", callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addParticipant3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addParticipant3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addParticipant3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addParticipant3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    answerCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/answer     
        // API https://api.openrainbow.org/voice/#api-Voice-Answer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(answerCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(answerCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(answerCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(answerCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(answerCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    blindTransferCall3PCC(callId: string, callData: { destination: { userId: string, resource: string } }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/blind-transfer     
        // API https://api.openrainbow.org/voice/#api-Voice-Blind_Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(blindTransferCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(blindTransferCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(blindTransferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(blindTransferCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(blindTransferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deflectCall3PCC(callId: string, callData: { destination: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/deflect     
        // API https://api.openrainbow.org/voice/#api-Voice-Deflect_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deflectCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/deflect", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deflectCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deflectCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deflectCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deflectCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    holdCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/hold     
        // API https://api.openrainbow.org/voice/#api-Voice-Hold_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(holdCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/hold", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(holdCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(holdCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(holdCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(holdCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    makeCall3PCC(callData: {
        deviceId: string,
        callerAutoAnswer: boolean,
        anonymous: boolean,
        calleeExtNumber: string,
        calleePbxId: string,
        calleeShortNumber: string,
        calleeCountry: string,
        dialPadCalleeNumber: string
    }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls     
        // API https://api.openrainbow.org/voice/#api-Voice-Make_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(makeCall3PCC) callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(makeCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(makeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(makeCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(makeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    mergeCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/merge     
        // API https://api.openrainbow.org/voice/#api-Voice-Merge_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(mergeCall3PCC) activeCallId : ", activeCallId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/merge", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(mergeCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(mergeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(mergeCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(mergeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    pickupCall3PCC(callData: {
        deviceId: string,
        callerAutoAnswer: boolean,
        calleeShortNumber: string
    }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/pickup
        // API https://api.openrainbow.org/voice/#api-Voice-Pickup_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(pickupCall3PCC) callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/pickup", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(pickupCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(pickupCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(pickupCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(pickupCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    releaseCall3PCC(callId: string, legId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId      
        // API https://api.openrainbow.org/voice/#api-Voice-Release_call
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/calls/" + callId;
            url += legId ? "?legId=" + legId:"";
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(releaseCall3PCC) (" + callId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveCall3PCC(callId: string, callData: { legId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/retrieve
        // API https://api.openrainbow.org/voice/#api-Voice-Retrieve_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCall3PCC) callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/retrieve", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    sendDTMF3PCC(callId: string, callData: { legId: string, digits: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/senddtmf
        // API https://api.openrainbow.org/voice/#api-Voice-Send_DTMF
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(sendDTMF3PCC) callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/senddtmf", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendDTMF3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendDTMF3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendDTMF3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendDTMF3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    snapshot3PCC(callId: string, deviceId: string, seqNum: number) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/snapshot 
        // API https://api.openrainbow.org/voice/#api-Voice-SnapshotCall
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/snapshot";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(snapshot3PCC) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(snapshot3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(snapshot3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(snapshot3PCC) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(snapshot3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    transferCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/transfer
        // API https://api.openrainbow.org/voice/#api-Voice-Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(transferCall3PCC) callData : ", callData);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/transfer", that.getRequestHeader(), callData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(transferCall3PCC) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(transferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(transferCall3PCC) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(transferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAVoiceMessage(messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessage
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages/" + messageId;
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteAVoiceMessage) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    deleteAllVoiceMessages(messageId: string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessages
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages";
            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteAllVoiceMessages) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getEmergencyNumbersAndEmergencyOptions() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/emergency-numbers 
        // API https://api.openrainbow.org/voice/#api-Voice-EmergencyNumbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/emergency-numbers";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getVoiceMessages(limit: number,
                     offset: number,
                     sortField: string,
                     sortOrder: number,
                     fromDate: string,
                     toDate: string,
                     callerName: string,
                     callerNumber: string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-GetVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/messages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate);
            addParamToUrl(urlParamsTab, "callerName", callerName);
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber);
            // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getVoiceMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getVoiceMessages) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getVoiceMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    getUserDevices() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/devices
        // API https://api.openrainbow.org/voice/#api-Voice-Devices
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/voice/v1.0/devices";
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getUserDevices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserDevices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserDevices) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getUserDevices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserDevices) error : ", err);
                return reject(err);
            });
        });
    }

    updateVoiceMessage(messageId: string, urlData: { read: boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId 
        // API https://api.openrainbow.org/voice/#api-Voice-UpdateVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateVoiceMessage) messageId : ", messageId + ", urlData : ", urlData);
            let data = {};
            that.http.put("/api/rainbow/voice/v1.0/messages/" + messageId, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateVoiceMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateVoiceMessage) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateVoiceMessage) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateVoiceMessage) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice    

    //region Rainbow Voice Voice Forward

    forwardCall(callForwardType: string, userId: string, urlData: { destinationType: string, number: string, activate: boolean, noReplyDelay: number }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards/:callForwardType 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Forward_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(forwardCall) callForwardType : ", callForwardType + ", urlData : ", urlData);
            let url: string = "/api/rainbow/voice/v1.0/forwards/" + callForwardType;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "userId ", userId + "");
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
            let data = {};
            that.http.put(url, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(forwardCall) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(forwardCall) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(forwardCall) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(forwardCall) error : ", err);
                return reject(err);
            });
        });
    }

    getASubscriberForwards(userId: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Get_Subscriber_call_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getASubscriberForwards) userId : ", userId);
            let url: string = "/api/rainbow/voice/v1.0/forwards";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "userId ", userId + "");
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
            let data = {};
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getASubscriberForwards) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getASubscriberForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getASubscriberForwards) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getASubscriberForwards) error : ", err);
                return reject(err);
            });
        });
    }

    // */

    //endregion Rainbow Voice Voice Forward

    //region Rainbow Voice Voice Search Hunting Groups

    searchCloudPBXhuntingGroups(name: string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/search/huntinggroups 
        // API https://api.openrainbow.org/voice/#api-Voice_Search_Hunting_Groups-Get_Cloud_PBX_Hunting_Groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchCloudPBXhuntingGroups) name : ", name);
            let url: string = "/api/rainbow/voice/v1.0/search/huntinggroups";
            let urlParamsTab: string[] = [];
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
            let data = {};
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(searchCloudPBXhuntingGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchCloudPBXhuntingGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchCloudPBXhuntingGroups) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchCloudPBXhuntingGroups) error : ", err);
                return reject(err);
            });
        });
    }

    // */

    //endregion Rainbow Voice Voice Search Hunting Groups

    //endregion Rainbow Voice

    //region Clients Versions


    createAClientVersion(id: string, version: string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions     
        // API https://api.openrainbow.org/admin/#api-clients_versions-PostClientsVersions
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createAClientVersion) id : ", id, ", version : ", version);
            let data = {
                id,
                version
            };
            that.http.post("/api/rainbow/admin/v1.0/clientsversions", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAClientVersion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAClientVersion) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAClientVersion) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAClientVersion(clientId: string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId      
        // API https://api.openrainbow.org/admin/#api-clients_versions-DeleteClientsVersions
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteAClientVersion) (" + clientId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getAClientVersionData(clientId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId 
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsVersionsId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/clientsversions/" + clientId;
            let urlParamsTab: string[] = [];
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getAClientVersionData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAClientVersionData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAClientVersionData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAClientVersionData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAClientVersionData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllClientsVersions(name?: string, typeClient?: string, limit: number = 100, offset?: number, sortField: string = "name", sortOrder: number = 1) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions 
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsversions
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/clientsversions";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (name) addParamToUrl(urlParamsTab, "name", name + "");
            if (typeClient) addParamToUrl(urlParamsTab, "type", typeClient + "");
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllClientsVersions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllClientsVersions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllClientsVersions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllClientsVersions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllClientsVersions) error : ", err);
                return reject(err);
            });
        });
    }

    updateAClientVersion(clientId: string, version: string) {
        // PUT  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId 
        // API https://api.openrainbow.org/admin/#api-clients_versions-PutClientsVersions
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAClientVersion) clientId : ", clientId + ", version : ", version);
            let data = {
                version
            };
            that.http.put("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAClientVersion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAClientVersion) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAClientVersion) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Clients Versions

    //region sites

    createASite(name: string, status: string, companyId: string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/sites     
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createASite) name : ", name + ", status : ", status, ", companyId : " + companyId);
            let data = {
                name,
                status,
                companyId
            };
            that.http.post("/api/rainbow/admin/v1.0/sites", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createASite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createASite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createASite) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createASite) error : ", err);
                return reject(err);
            });
        });
    }

    deleteSite(siteId: string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId}      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteSite) (" + siteId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteSite) (" + siteId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteSite) (" + siteId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getSiteData(siteId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/sites/" + siteId;
            //addParamToUrl(url, "rvcpInstanceId", rvcpInstanceId);

            that._logger.log(that.INTERNAL, LOG_ID + "(getSiteData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSiteData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSiteData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSiteData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSiteData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSites(format = "small", limit = 100, offset = 0, sortField = "name", sortOrder: number, name: string, companyId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/sites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSites) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSites) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSites) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSites) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSites) error : ", err);
                return reject(err);
            });
        });
    }

    updateSite(siteId: string, name: string, status: string, companyId: string) {
        // PUT https://openrainbow.com/api/rainbow/admin/v1.0/sites/:siteId
        let that = this;
        let data = {
            name,
            status,
            companyId
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSite) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion sites

    //region systems

    // systems
    createSystem(name: string, pbxId: string = undefined, pbxLdapId: string = undefined, siteId: string, type: string, country: string, version ?: string,
                 serverPingTimeout ?: number, pbxMainBundlePrefix ?: Array<string>, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>,
                 pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, activationCode ?: string, isCentrex ?: boolean,
                 isShared ?: boolean, bpId ?: string, isOxoManaged ?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-PostSystems
        // POST /api/rainbow/admin/v1.0/systems

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createSystem) name : ", name + ", pbxId : ", pbxId);
            let data: any = {
                name
            };
            if (pbxId) {
                data.pbxId = pbxId;
            }
            if (pbxLdapId) {
                data.pbxLdapId = pbxLdapId;
            }
            if (siteId) {
                data.siteId = siteId;
            }
            if (type) {
                data.type = type;
            }
            if (country) {
                data.country = country;
            }
            if (version) {
                data.version = version;
            }
            if (serverPingTimeout) {
                data.serverPingTimeout = serverPingTimeout;
            }
            if (pbxMainBundlePrefix) {
                data.pbxMainBundlePrefix = pbxMainBundlePrefix;
            }
            if (usePbxMainBundlePrefix) {
                data.usePbxMainBundlePrefix = usePbxMainBundlePrefix;
            }
            if (pbxNumberingTranslator) {
                data.pbxNumberingTranslator = pbxNumberingTranslator;
            }
            if (pbxNationalPrefix) {
                data.pbxNationalPrefix = pbxNationalPrefix;
            }
            if (pbxInternationalPrefix) {
                data.pbxInternationalPrefix = pbxInternationalPrefix;
            }
            if (searchResultOrder) {
                data.searchResultOrder = searchResultOrder;
            }
            if (activationCode) {
                data.activationCode = activationCode;
            }
            if (isCentrex) {
                data.isCentrex = isCentrex;
            }
            if (isShared) {
                data.isShared = isShared;
            }
            if (bpId) {
                data.bpId = bpId;
            }
            if (isOxoManaged) {
                data.isOxoManaged = isOxoManaged;
            }
            that.http.post("/api/rainbow/admin/v1.0/systems", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSystem) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSystem) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSystem) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSystem) error : ", err);
                return reject(err);
            });
        });
    }

    deleteSystem(systemId: string) {
        // API https://api.openrainbow.org/admin/#api-systems-DeleteSystems
        // DELETE /api/rainbow/admin/v1.0/systems/:systemId 

        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/systems/" + systemId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteSystem) (" + systemId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteSystem) (" + systemId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteSystem) (" + systemId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getSystemConnectionState(systemId: string, format: string = "small", connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsConnectionState
        // GET /api/rainbow/admin/v1.0/systems/:systemId/state

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/state";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemConnectionState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemConnectionState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemConnectionState) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemConnectionState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemConnectionState) error : ", err);
                return reject(err);
            });
        });
    }

    getSystemDataByPbxId(pbxId: string, connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsIdByPbxId
        // GET /api/rainbow/admin/v1.0/systems/pbxid/:pbxId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/pbxid/" + pbxId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemDataByPbxId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemDataByPbxId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemDataByPbxId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemDataByPbxId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemDataByPbxId) error : ", err);
                return reject(err);
            });
        });
    }

    getSystemData(systemId: string, connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsId
        // GET /api/rainbow/admin/v1.0/systems/:systemId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSystems(connectionHistory ?: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "pbxId", sortOrder: number = 1,
                  name ?: string, type ?: string, status ?: string, siteId ?: string, companyId ?: string, bpId ?: string, isShared ?: boolean, isCentrex ?: boolean,
                  isSharedOrCentrex ?: boolean, isOxoManaged ?: boolean, fromCreationDate ?: string, toCreationDate ?: string) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystems
        // GET /api/rainbow/admin/v1.0/systems

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            addParamToUrl(urlParamsTab, "format", connectionHistory);
            addParamToUrl(urlParamsTab, "limit", connectionHistory);
            addParamToUrl(urlParamsTab, "offset", connectionHistory);
            addParamToUrl(urlParamsTab, "sortField", connectionHistory);
            addParamToUrl(urlParamsTab, "sortOrder", connectionHistory);
            addParamToUrl(urlParamsTab, "name", connectionHistory);
            addParamToUrl(urlParamsTab, "type", connectionHistory);
            addParamToUrl(urlParamsTab, "status", connectionHistory);
            addParamToUrl(urlParamsTab, "siteId", connectionHistory);
            addParamToUrl(urlParamsTab, "companyId", connectionHistory);
            addParamToUrl(urlParamsTab, "bpId", connectionHistory);
            addParamToUrl(urlParamsTab, "isShared", connectionHistory);
            addParamToUrl(urlParamsTab, "isCentrex", connectionHistory);
            addParamToUrl(urlParamsTab, "isSharedOrCentrex", connectionHistory);
            addParamToUrl(urlParamsTab, "isOxoManaged", connectionHistory);
            addParamToUrl(urlParamsTab, "fromCreationDate", connectionHistory);
            addParamToUrl(urlParamsTab, "toCreationDate", connectionHistory);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystems) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSystems) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystems) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSystems) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSystems) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfCountriesAllowedForSystems() {
        // GET /api/rainbow/admin/v1.0/systems/countries
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsCountries
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/countries";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountriesAllowedForSystems) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfCountriesAllowedForSystems) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountriesAllowedForSystems) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfCountriesAllowedForSystems) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfCountriesAllowedForSystems) error : ", err);
                return reject(err);
            });
        });
    }

    updateSystem(systemId: string, name ?: string, siteId ?: string, pbxLdapId ?: string, type ?: string, country ?: string, version ?: string,
                 serverPingTimeout: number = 100, pbxMainBundlePrefix ?: string, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>,
                 isShared ?: boolean, bpId ?: string) {
        // API https://api.openrainbow.org/admin/#api-systems-PutSystems
        // PUT /api/rainbow/admin/v1.0/systems/:systemId
        let that = this;

        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/systems/" + systemId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            let data: any = {};
            if (name) data.name = name;
            if (siteId) data.siteId = siteId;
            if (pbxLdapId) data.pbxLdapId = pbxLdapId;
            if (type) data.type = type;
            if (country) data.country = country;
            if (version) data.version = version;
            if (serverPingTimeout) data.serverPingTimeout = serverPingTimeout;
            if (pbxMainBundlePrefix) data.pbxMainBundlePrefix = pbxMainBundlePrefix;
            if (usePbxMainBundlePrefix) data.usePbxMainBundlePrefix = usePbxMainBundlePrefix;
            if (pbxNumberingTranslator) data.pbxNumberingTranslator = pbxNumberingTranslator;
            if (pbxNationalPrefix) data.pbxNationalPrefix = pbxNationalPrefix;
            if (pbxInternationalPrefix) data.pbxInternationalPrefix = pbxInternationalPrefix;
            if (searchResultOrder) data.searchResultOrder = searchResultOrder;
            if (isShared) data.isShared = isShared;
            if (bpId) data.bpId = bpId;

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateASystemPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateASystemPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateASystemPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateASystemPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    // systems phone numbers
    getASystemPhoneNumber(systemId: string, phoneNumberId: string) {
        // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbersId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers/" + phoneNumberId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getASystemPhoneNumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getASystemPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getASystemPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getASystemPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getASystemPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSystemPhoneNumbers(systemId: string, shortNumber?: string, internalNumber ?: string, pbxUserId ?: string, companyPrefix?: string, isMonitored ?: boolean, name ?: string, deviceName ?: string, isAssignedToUser ?: boolean, format: string = "small", limit: number = 100, offset ?: number, sortField: string = "shortNumber", sortOrder: number = 1) {
        // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            addParamToUrl(urlParamsTab, "pbxUserId", pbxUserId);
            addParamToUrl(urlParamsTab, "companyPrefix", companyPrefix);
            addParamToUrl(urlParamsTab, "isMonitored", isMonitored);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "deviceName", deviceName);
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystemPhoneNumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSystemPhoneNumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystemPhoneNumbers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSystemPhoneNumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSystemPhoneNumbers) error : ", err);
                return reject(err);
            });
        });
    }

    updateASystemPhoneNumber(systemId: string, phoneNumberId: string, isMonitored ?: boolean, userId ?: string, internalNumber ?: string,
                             number ?: string, type ?: string, deviceType ?: string, firstName ?: string, lastName ?: string, deviceName ?: string, isVisibleByOthers ?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-PutSystemPhoneNumbers
        // PUT /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
        let that = this;

        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers/" + phoneNumberId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            //addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            let data: any = {};
            if (isMonitored) data.isMonitored = isMonitored;
            if (userId) data.userId = userId;
            if (internalNumber) data.internalNumber = internalNumber;
            if (number) data.number = number;
            if (type) data.type = type;
            if (deviceType) data.deviceType = deviceType;
            if (firstName) data.firstName = firstName;
            if (lastName) data.lastName = lastName;
            if (deviceName) data.deviceName = deviceName;
            if (isVisibleByOthers) data.isVisibleByOthers = isVisibleByOthers;

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateASystemPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateASystemPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateASystemPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateASystemPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    //region pcg pbxs

    getPbxData(pbxId: string) {
        // GET /api/rainbow/pcg/v1.0/pbxs/:pbxId
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getPbxData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPbxData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPbxData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPbxData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPbxData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPbxs(format: string = "small", sortField: string = "id", limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, type: string = undefined, status: string = undefined, siteId: string = undefined, companyId: string = undefined,
               bpId: string = undefined, isShared: boolean = undefined, isCentrex: boolean = undefined, isSharedOrCentrex: boolean = undefined, isOxoManaged: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined) {
        // GET /api/rainbow/pcg/v1.0/pbxs
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxs
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "siteId", siteId);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "isShared", isShared);
            addParamToUrl(urlParamsTab, "isCentrex", isCentrex);
            addParamToUrl(urlParamsTab, "isSharedOrCentrex", isSharedOrCentrex);
            addParamToUrl(urlParamsTab, "isOxoManaged", isOxoManaged);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPbxs) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxs) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPbxs) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPbxs) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion pcg pbxs 

    //region pcg pbxs phone numbers 

    createPbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) {
        // POST https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PostPcgPbxPhoneNb
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            if (shortNumber) {
                data.shortNumber = shortNumber;
            }
            if (voiceMailNumber) {
                data.voiceMailNumber = voiceMailNumber;
            }
            if (pbxUserId) {
                data.lastName = pbxUserId;
            }
            if (companyPrefix) {
                data.companyPrefix = companyPrefix;
            }
            if (internalNumber) {
                data.internalNumber = internalNumber;
            }
            if (type) {
                data.type = type;
            }
            if (deviceType) {
                data.deviceType = deviceType;
            }
            if (firstName) {
                data.firstName = firstName;
            }
            if (lastName) {
                data.lastName = lastName;
            }
            if (deviceName) {
                data.deviceName = deviceName;
            }
            that._logger.log(that.INTERNAL, LOG_ID + "(createPbxPhoneNumber) args : ", data);
            that.http.post("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createPbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPbxPhoneNumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    deletePbxPhoneNumber(pbxId: string, shortNumber: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-DeletePcgPbxPhoneNbShortNb
        // DELETE https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getPbxPhoneNumber(pbxId: string, shortNumber: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNbShortNb
        // GET https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getPbxPhoneNumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPbxPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPbxPhoneNumbers(pbxId: string, format: string = "small", shortNumber: string, internalNumber: string, pbxUserId: string,
                          companyPrefix: string, isMonitored: boolean, name: string, nameOrShortNumber: string, deviceName: string,
                          isAssignedToUser: boolean, limit: number = 100, offset: number, sortField: string = "shortNumber", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNb
        // GET https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            addParamToUrl(urlParamsTab, "pbxUserId", pbxUserId);
            addParamToUrl(urlParamsTab, "companyPrefix", companyPrefix);
            addParamToUrl(urlParamsTab, "isMonitored", isMonitored);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "nameOrShortNumber", nameOrShortNumber);
            addParamToUrl(urlParamsTab, "deviceName", deviceName);
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxPhoneNumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPbxPhoneNumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxPhoneNumbers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPbxPhoneNumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPbxPhoneNumbers) error : ", err);
                return reject(err);
            });
        });
    }

    updatepbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, companyName: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PutPcgPbxPhoneNbShortNb
        // PUT https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber
        let that = this;
        let data: any = {};

        if (shortNumber) {
            data.shortNumber = shortNumber;
        }
        if (voiceMailNumber) {
            data.voiceMailNumber = voiceMailNumber;
        }
        if (pbxUserId) {
            data.pbxUserId = pbxUserId;
        }
        if (companyPrefix) {
            data.companyPrefix = companyPrefix;
        }
        if (companyName) {
            data.companyName = companyName;
        }
        if (internalNumber) {
            data.internalNumber = internalNumber;
        }
        if (type) {
            data.type = type;
        }
        if (deviceType) {
            data.deviceType = deviceType;
        }
        if (firstName) {
            data.firstName = firstName;
        }
        if (lastName) {
            data.lastName = lastName;
        }
        if (deviceName) {
            data.deviceName = deviceName;
        }

        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateDirectoryEntry) REST data params : ", data);

            that.http.put("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatepbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updatepbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatepbxPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatepbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion pcg pbxs phone numbers

    //endregion systems

    //region Rainbow Company Directory portal 
    // https://api.openrainbow.org/directory/
    //region directory
    // Create a directory entry
    createDirectoryEntry(companyId: string,
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
                         custom2: string
    ) {
        // POST  https://openrainbow.com/api/rainbow/directory/v1.0/entries     
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

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
            that._logger.log(that.INTERNAL, LOG_ID + "(createDirectoryEntry) args : ", data);
            that.http.post("/api/rainbow/directory/v1.0/entries", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createDirectoryEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createDirectoryEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createDirectoryEntry) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }

    // delete all the entries in the directory of a company
    deleteCompanyDirectoryAllEntry(companyId: string) {
        // DELETE https://openrainbow.com/api/rainbow/directory/v1.0/companies/:companyId      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/companies/" + companyId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // delete a directory entry
    deleteDirectoryEntry(entryId: string) {
        // API https://api.openrainbow.org/directory/#api-directory-DeleteDirectory
        // DELETE /api/rainbow/directory/v1.0/entries/:entryId      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteDirectoryEntry) (" + entryId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // Get a directory entry data
    getDirectoryEntryData(entryId: string, format: string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/:entryId 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/" + entryId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getDirectoryEntryData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDirectoryEntryData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDirectoryEntryData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDirectoryEntryData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDirectoryEntryData) error : ", err);
                return reject(err);
            });
        });
    }

    // Get a list of directory entries data
    getListDirectoryEntriesData(companyId: string,
                                organisationIds: string,
                                name: string,
                                search: string,
                                type: string,
                                companyName: string,
                                phoneNumbers: string,
                                fromUpdateDate: Date,
                                toUpdateDate: Date,
                                tags: string,
                                format: string,
                                limit: number,
                                offset: number,
                                sortField: string,
                                sortOrder: number,
                                view: string) {
        // API https://api.openrainbow.org/directory/#api-directory-GetDirectoryList
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "organisationIds", organisationIds);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "companyName", companyName);
            addParamToUrl(urlParamsTab, "phoneNumbers", phoneNumbers);
            addParamToUrl(urlParamsTab, "fromUpdateDate", fromUpdateDate ? fromUpdateDate.toJSON():"");
            addParamToUrl(urlParamsTab, "toUpdateDate", toUpdateDate ? toUpdateDate.toJSON():"");
            addParamToUrl(urlParamsTab, "tags", tags);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "view", view);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListDirectoryEntriesData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListDirectoryEntriesData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListDirectoryEntriesData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListDirectoryEntriesData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListDirectoryEntriesData) error : ", err);
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
        let data: any = {};

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
            that._logger.log(that.INTERNAL, LOG_ID + "(updateDirectoryEntry) REST data params : ", data);

            that.http.put("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateDirectoryEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateDirectoryEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateDirectoryEntry) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }

    ImportDirectoryCsvFile = function (companyId, csvContent, label) {
        // POST  https://openrainbow.com/api/rainbow/directories/imports?companyId=:companyId  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports"
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];

            let data = csvContent;
            that._logger.log(that.INTERNAL, LOG_ID + "(ImportDirectoryCsvFile) args : ", data);
            that.http.post(url, that.getPostHeader("text/csv"), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ImportDirectoryCsvFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ImportDirectoryCsvFile) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ImportDirectoryCsvFile) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ImportDirectoryCsvFile) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion directory

    //region directory tags
    // List all tags assigned to directory entries
    getAllTagsAssignedToDirectoryEntries(companyId: string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/tags" + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    // Remove a given tag from all the directory entries
    removeTagFromAllDirectoryEntries(companyId: string, tag: string) {
        // DELETE https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags      
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // Rename a tag for all assigned directory entries
    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string) {
        // PUT https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags
        let that = this;

        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            let data = {
                newTagName
            };

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(renameTagForAllAssignedDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renameTagForAllAssignedDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    // Return stats regarding tags of directory entries
    getStatsRegardingTagsOfDirectoryEntries(companyId: string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags/stats
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/tags/stats";
            addParamToUrl([url], "companyId", companyId);
            url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion directory tags

    //endregion Rainbow Company Directory portal

    //region Rainbow Bubbles Polls

    createBubblePoll(roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean = false, duration: number = 0) {
        // API https://api.openrainbow.org/enduser/#api-polls-Create_poll
        // POST /api/rainbow/enduser/v1.0/polls

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

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

            if (anonymous!=undefined) {
                data.anonymous = anonymous;
            }

            if (duration!=undefined) {
                data.duration = duration;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(createBubblePoll) args : ", data);
            that.http.post("/api/rainbow/enduser/v1.0/polls", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubblePoll) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubblePoll) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubblePoll) No pollId provided");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteBubblePoll) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubblePoll) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteBubblePoll) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubblePoll) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getBubblePoll(pollId: string, format: string = "small") {
        // API https://api.openrainbow.org/enduser/#api-polls-Get_a_poll
        // GET /api/rainbow/enduser/v1.0/polls/:pollId 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/polls/" + pollId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePoll) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblePoll) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    getBubblePollsByBubble(roomId: string, format: string = "small", limit: number = 100, offset: number) {
        // API https://api.openrainbow.org/enduser/#api-polls-Get_polls
        // GET /api/rainbow/enduser/v1.0/polls

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/polls";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "roomId", roomId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePollsByBubble) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblePollsByBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePollsByBubble) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblePollsByBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblePollsByBubble) error : ", err);
                return reject(err);
            });
        });
    }

    publishBubblePoll(pollId: string) {
        // API https://api.openrainbow.org/enduser/#api-polls-Publish_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/publish

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/publish", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(publishBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(publishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(publishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    terminateBubblePoll(pollId: string) {
        // API https://api.openrainbow.org/enduser/#api-polls-Terminate_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/terminate

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/terminate", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(terminateBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(terminateBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(terminateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(terminateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    unpublishBubblePoll(pollId: string) {
        // API https://api.openrainbow.org/enduser/#api-polls-Unpublish_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/unpublish

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/unpublish", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unpublishBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(unpublishBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unpublishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unpublishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    updateBubblePoll(pollId: string, roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean, duration: number) {
        // API https://api.openrainbow.org/enduser/#api-polls-Update_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

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

            if (anonymous!=undefined) {
                data.anonymous = anonymous;
            }

            if (duration) {
                data.duration = duration;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(updateBubblePoll) args : ", data);
            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    votesForBubblePoll(pollId: string, votes: Array<{ question: number, answers: Array<number> }>) {
        // API https://api.openrainbow.org/enduser/#api-polls-Votes_for_a_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/vote

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
                votes
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/vote", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(votesForBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(votesForBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(votesForBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(votesForBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Bubbles Polls

    //region Conference v2
    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string) {
        let that = this;
        return that.restConferenceV2.addPSTNParticipantToConference(roomId, participantPhoneNumber, country);
    }

    askConferenceSnapshotV2(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.snapshotConference(roomId, limit, offset);
    }

    snapshotConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.restConferenceV2.snapshotConference(roomId, limit, offset);
    }

    delegateConference(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.delegateConference(roomId, userId);
    }

    disconnectPSTNParticipantFromConference(roomId: string) {
        let that = this;
        return that.restConferenceV2.disconnectPSTNParticipantFromConference(roomId);
    }

    disconnectParticipantFromConference(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.disconnectParticipantFromConference(roomId, userId);
    }

    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.restConferenceV2.getTalkingTimeForAllPparticipantsInConference(roomId, limit, offset);
    }

    joinConferenceV2(roomId: string, participantPhoneNumber: string = undefined, country: string = undefined, deskphone: boolean = false, dc: Array<string> = undefined, mute: boolean = false, microphone: boolean = false, media: Array<string> = undefined, resourceId: string = undefined) {
        let that = this;
        return that.restConferenceV2.joinConference(roomId, participantPhoneNumber, country, deskphone, dc, mute, microphone, media, resourceId);
    }

    pauseRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.pauseRecording(roomId);
    }

    resumeRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.resumeRecording(roomId);
    }

    startRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.startRecording(roomId);
    }

    stopRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.stopRecording(roomId);
    }

    rejectAVideoConference(roomId: string) {
        let that = this;
        return that.restConferenceV2.rejectAVideoConference(roomId);
    }

//Start a PSTN, WebRTC conference or a webinar in a room  () {
    startConferenceOrWebinarInARoom(roomId: string, services) {
        let that = this;
        return that.restConferenceV2.startConferenceOrWebinarInARoom(roomId, services);
    }

    stopConferenceOrWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.stopConferenceOrWebinar(roomId);
    }

    subscribeForParticipantVideoStream(roomId: string, userId: string, media: string = "video", subStreamLevel: number = 0, dynamicFeed: boolean = false) {
        let that = this;
        return that.restConferenceV2.subscribeForParticipantVideoStream(roomId, userId, media, subStreamLevel, dynamicFeed);
    }

    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option: string = " unmute") {
        let that = this;
        return that.restConferenceV2.updatePSTNParticipantParameters(roomId, phoneNumber, option);
    }

    updateConferenceParameters(roomId: string, option: string = "unmute") {
        let that = this;
        return that.restConferenceV2.updateConferenceParameters(roomId, option);
    }

    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string) {
        let that = this;
        return that.restConferenceV2.updateParticipantParameters(roomId, userId, option, media, bitRate, subStreamLevel, publisherId);
    }

    allowTalkWebinar(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.allowTalkWebinar(roomId, userId);
    }

    disableTalkWebinar(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.disableTalkWebinar(roomId, userId);
    }

    lowerHandWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.lowerHandWebinar(roomId);
    }

    raiseHandWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.raiseHandWebinar(roomId);
    }

    stageDescriptionWebinar(roomId: string, userId: string, type: string, properties: Array<string>) {
        let that = this;
        return that.restConferenceV2.stageDescriptionWebinar(roomId, userId, type, properties);
    }

    //endregion Conference v2

    //region meetings - PGI => to be removed.

    deletePersonalMeetingBubble() {
        // API https://api.openrainbow.org/enduser/#api-meetings-DeleteMeetings
        // DELETE /api/rainbow/enduser/v1.0/meetings/delete
    }

    getCurrentMeetingBubble() {
    }

    getPersonalMeetingBubble() {
    }

    reuseAFormerMeetingBubble() {
    }

    savePersonalMeetingBubble() {
    }

    startAnAdHocConference() {
    }

    //endregion meetings

    //region Webinar

    createWebinar(name: string,
                  subject: string,
                  waitingRoomStartDate: Date,
                  webinarStartDate: Date,
                  webinarEndDate: Date,
                  reminderDates: Array<Date>,
                  timeZone: string,
                  register: boolean,
                  approvalRegistrationMethod: string,
                  passwordNeeded: boolean,
                  isOrganizer: boolean,
                  waitingRoomMultimediaURL: Array<string>,
                  stageBackground: string,
                  chatOption: string) {
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

    updateWebinar(webinarId: string,
                  name: string,
                  subject: string,
                  waitingRoomStartDate: Date,
                  webinarStartDate: Date,
                  webinarEndDate: Date,
                  reminderDates: Array<Date>,
                  timeZone: string,
                  register: boolean,
                  approvalRegistrationMethod: string,
                  passwordNeeded: boolean,
                  isOrganizer: boolean,
                  waitingRoomMultimediaURL: Array<string>,
                  stageBackground: string,
                  chatOption: string) {
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

    getWebinarData(webinarId: string) {
        let that = this;
        return that.restWebinar.getWebinarData(webinarId);
    }

    getWebinarsData(role: string) {
        let that = this;
        return that.restWebinar.getWebinarsData(role);
    }

    warnWebinarModerators(webinarId: string) {
        let that = this;
        return that.restWebinar.warnWebinarModerators(webinarId);
    }

    publishAWebinarEvent(webinarId: string) {
        let that = this;
        return that.restWebinar.publishAWebinarEvent(webinarId);
    }

    deleteWebinar(webinarId: string) {
        let that = this;
        return that.restWebinar.deleteWebinar(webinarId);
    }

    //endregion Webinar

    //region Customer Care

    //region Customer Care - Administrators Group

    getCustomerCareAdministratorsGroup() {
        // API https://api.openrainbow.org/customercare/#api-Administrators_group-GetCcareAdminsGroup
        // GET /api/rainbow/customercare/v1.0/administrators
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/administrators" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCustomerCareAdministratorsGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCustomerCareAdministratorsGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCustomerCareAdministratorsGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCustomerCareAdministratorsGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCustomerCareAdministratorsGroup) error : ", err);
                return reject(err);
            });
        });
    }

    addAdministratorToGroup(userId : string) {
        // API https://api.openrainbow.org/customercare/#api-Administrators_group-PostCcareAdminsGroup
        // URL POST /api/rainbow/customercare/v1.0/administrators/:userId
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/administrators/" + userId;
            let data: any = {};
            //addPropertyToObj(data, "requestedCompanyId", requestedCompanyId, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addAdministratorToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addAdministratorToGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addAdministratorToGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addAdministratorToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    removeAdministratorFromGroup(userId : string) {
        // API https://api.openrainbow.org/customercare/#api-Administrators_group-DeleteCcareAdminsGroup
        // DELETE /api/rainbow/customercare/v1.0/administrators/:userId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeAdministratorFromGroup) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(removeAdministratorFromGroup) No pollId provided");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/administrators/" + userId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeAdministratorFromGroup) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeAdministratorFromGroup) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeAdministratorFromGroup) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeAdministratorFromGroup) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Customer Care - Administrators Group

    //region Customer Care - Logs

    getIssue(logId : string) {
        // API https://api.openrainbow.org/customercare/#api-Logs-getCcareOneLog
        // GET /api/rainbow/customercare/v1.0/logs/:logId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/logs/" + logId ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getIssue) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getIssue) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getIssue) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getIssue) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getIssue) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfIssues(limit : number = 100, offset : number = 0, sortField : string = "creationDate",
    sortOrder : number = -1, companyId : string, bpId : string, customerCategory : string = "all", name : string, 
    version : string, device : string, fromCreationDate : string, toCreationDate : string,
    fromOccurrenceDate : string, toOccurrenceDate : string, format : string = "small") {
        // API https://api.openrainbow.org/customercare/#api-Logs-getCcareLogs
        // GET /api/rainbow/customercare/v1.0/logs
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/logs" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "customerCategory", customerCategory);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "version", version);
            addParamToUrl(urlParamsTab, "device", device);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate);
            addParamToUrl(urlParamsTab, "fromOccurrenceDate", fromOccurrenceDate);
            addParamToUrl(urlParamsTab, "toOccurrenceDate", toOccurrenceDate);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssues) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfIssues) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssues) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfIssues) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfIssues) error : ", err);
                return reject(err);
            });
        });
    }


    //endregion Customer Care - Logs

    //region Customer Care - Users Logs
    getListOfIssuesForUser(userId : string, format : string = "small") {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-GetCcareUsersLogs
        // GET /api/rainbow/customercare/v1.0/users/:userId/logs
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId;
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssuesForUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfIssuesForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssuesForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfIssuesForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfIssuesForUser) error : ", err);
                return reject(err);
            });
        });
    }

    getIssueForUser(userId : string, logId : string ) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-GetCcareUsersOneLogs
        // GET /api/rainbow/customercare/v1.0/users/:userId/logs/:logId
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId;
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getIssueForUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getIssueForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getIssueForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getIssueForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getIssueForUser) error : ", err);
                return reject(err);
            });
        });
    }

    initiateLogsContext(userId : string, occurrenceDate : string, occurrenceDateTimezone : string, type : string,
    description : string, resourceId : string, externalRef : string, device : string, attachments : Array<string>, version : string, deviceDetails : any) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogs
        // URL POST /api/rainbow/customercare/v1.0/users/:userId/logs
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs";
            let data: any = {};
            addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);
            addPropertyToObj(data, "occurrenceDateTimezone", occurrenceDateTimezone, false);
            addPropertyToObj(data, "type", type, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "resourceId", resourceId, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "device", device, false);
            addPropertyToObj(data, "attachments", attachments, false);
            addPropertyToObj(data, "version", version, false);
            addPropertyToObj(data, "deviceDetails", deviceDetails, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateLogsContext) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateLogsContext) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    completeLogsContext(userId : string, logId : string, occurrenceDate : string, occurrenceDateTimezone : string,
                        description : string, externalRef : string, device : string, attachments : Array<string>, version : string, deviceDetails : any) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-PutCcareUsersLogs
        // PUT /api/rainbow/customercare/v1.0/users/:userId/logs/:logId

        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId;
            let data: any = {};
            addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);
            addPropertyToObj(data, "occurrenceDateTimezone", occurrenceDateTimezone, false);
            //addPropertyToObj(data, "type", type, false);
            addPropertyToObj(data, "description", description, false);
            //addPropertyToObj(data, "resourceId", resourceId, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "device", device, false);
            addPropertyToObj(data, "attachments", attachments, false);
            addPropertyToObj(data, "version", version, false);
            addPropertyToObj(data, "deviceDetails", deviceDetails, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(completeLogsContext) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(completeLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(completeLogsContext) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(completeLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    cancelOrCloseLogsSubmission(userId : string, logId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-DeleteCcareUsersLogs
        // DELETE /api/rainbow/customercare/v1.0/users/:userId/logs/:logId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(cancelOrCloseLogsSubmission) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(cancelOrCloseLogsSubmission) No pollId provided");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(cancelOrCloseLogsSubmission) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(cancelOrCloseLogsSubmission) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(cancelOrCloseLogsSubmission) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelOrCloseLogsSubmission) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    acknowledgeLogsRequest(userId : string, logId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogsReqAck
        // URL POST /api/rainbow/customercare/v1.0/users/:userId/logs/:logId/ack
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/ack";
            let data: any = {};
            //addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateLogsContext) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateLogsContext) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    rejectLogsRequest(userId : string, logId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogsReqReject
        // URL POST /api/rainbow/customercare/v1.0/users/:userId/logs/:logId/reject
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/reject";
            let data: any = {};
            //addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateLogsContext) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateLogsContext) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customer Care - Users Logs

    //region Customer Care - Users Logs Append
    adminOrBotAddAdditionalFiles(userId : string, logId : string, attachments : Array<string>, conversationId : string, fileName : string ) {
        // API https://api.openrainbow.org/customercare/#api-Users_logs_append-PutCcareUsersLogsAttachments
        // PUT "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/attachments"

        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/attachments";
            let data: any = {};
            addPropertyToObj(data, "conversationId", conversationId, false);
            addPropertyToObj(data, "fileName", fileName, false);
            addPropertyToObj(data, "attachments", attachments, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(adminOrBotAddAdditionalFiles) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(adminOrBotAddAdditionalFiles) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(adminOrBotAddAdditionalFiles) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(adminOrBotAddAdditionalFiles) error : ", err);
                return reject(err);
            });
        });

    }

    //endregion Customer Care - Users Logs Append

    //region Customer Care - Users resources
    getListOfResourcesForUser( userId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_resources-GetCcareUsersResources
        // GET /api/rainbow/customercare/v1.0/users/:userId/resources
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/resources" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfResourcesForUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfResourcesForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfResourcesForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfResourcesForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfResourcesForUser) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customer Care - Users resources

    //region Customer Care - Users ticket
    createAnAtriumTicket(userId : string, subject : string, description : string, additionalDescription : string, resource : string, externalRef : string, logs : Array<string> ) {
        // API https://api.openrainbow.org/customercare/#api-Users_ticket-PostCcareUsersTicket
        // URL POST /api/rainbow/customercare/v1.0/users/:userId/ticket
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket";
            let data: any = {};
            addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "additionalDescription", additionalDescription, false);
            addPropertyToObj(data, "resource", resource, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "logs", logs, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAnAtriumTicket) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAnAtriumTicket) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAnAtriumTicket) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAnAtriumTicket) error : ", err);
                return reject(err);
            });
        });
    }

    updateAnAtriumTicket(userId : string, ticketId : string, subject : string, description : string, additionalDescription : string, resource : string, externalRef : string, logs : Array<string> ) {
        // API https://api.openrainbow.org/customercare/#api-Users_ticket-PutCcareUsersTicket
        // URL PUT /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId;
            let data: any = {};
            addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "additionalDescription", additionalDescription, false);
            addPropertyToObj(data, "resource", resource, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "logs", logs, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAnAtriumTicket) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAnAtriumTicket) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAnAtriumTicket) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAnAtriumTicket) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAnAtriumTicketInformation(userId : string, ticketId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_ticket-DeleteCcareUsersTicket
        // DELETE /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!userId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAnAtriumTicketInformation) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAnAtriumTicketInformation) No pollId provided");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteAnAtriumTicketInformation) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnAtriumTicketInformation) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteAnAtriumTicketInformation) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAnAtriumTicketInformation) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    readAnAtriumTicketInformation( userId : string, ticketId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_ticket-GetCcareUsersTicket
        // GET /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(readAnAtriumTicketInformation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(readAnAtriumTicketInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(readAnAtriumTicketInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(readAnAtriumTicketInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(readAnAtriumTicketInformation) error : ", err);
                return reject(err);
            });
        });
    }

    readAllTicketsOnASameCompany(userId : string) {
        // API https://api.openrainbow.org/customercare/#api-Users_ticket-GetAllCcareUsersTickets
        // GET /api/rainbow/customercare/v1.0/users/:userId/ticket
        let that = this;
        return new Promise(function (resolve, reject) {
            userId = userId ? userId : that.userId ;
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(readAllTicketsOnASameCompany) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(readAllTicketsOnASameCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(readAllTicketsOnASameCompany) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(readAllTicketsOnASameCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(readAllTicketsOnASameCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customer Care - Users ticket

    //endregion Customer Care

    //region Tasks MANAGEMENT

    async addTask(task:any) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodo
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/todos
        let that = this;
        return new Promise(function (resolve, reject) {
            let userId = that.userId ;
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos";
            let data: any = task;
            /*addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            // */

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addTask) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addTask) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCategories() {
        // API
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/category";
            /*
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "category", category);
            url = urlParamsTab[0]; // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getCategories) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCategories) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCategories) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCategories) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCategories) error : ", err);
                return reject(err);
            });
        });
    }

    createTaskcategory(category:string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoCategory
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/todos/category
        let that = this;
        return new Promise(function (resolve, reject) {
            let userId = that.userId ;
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/category";
            let data: any = {};
            addPropertyToObj(data, "category", category, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createTaskcategory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createTaskcategory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createTaskcategory) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createTaskcategory) error : ", err);
                return reject(err);
            });
        });
    }

    createOrUpdatePropertiesTaskByCategoryId(categoryId:string, properties: any) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoProperties
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId
        let that = this;
        return new Promise(function (resolve, reject) {
            let userId = that.userId ;
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/todos/properties/" + categoryId;
            let data: any = {};
            addPropertyToObj(data, "properties", properties, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createOrUpdatePropertiesTaskByCategoryId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createOrUpdatePropertiesTaskByCategoryId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createOrUpdatePropertiesTaskByCategoryId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createOrUpdatePropertiesTaskByCategoryId) error : ", err);
                return reject(err);
            });
        });
    }

    //updatePropertiesTaskByCategoryId () {}

    async getTaskById(taskId: string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/" + taskId;
            /*let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "taskId", taskId);
            url = urlParamsTab[0];
            // */

            that._logger.log(that.INTERNAL, LOG_ID + "(getTaskById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTaskById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTaskById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTaskById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTaskById) error : ", err);
                return reject(err);
            });
        });
    }

    getTasksByCategoryId(category : string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-getTodoCategory
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId
        let that = this;

        return new Promise(
            function (resolve, reject) {
                let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/category/" + category;
                /* let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "category", category);
                url = urlParamsTab[0];
                // */

                that._logger.log(that.INTERNAL, LOG_ID + "(getTasksByCategoryId) REST url : ", url);

                that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(getTasksByCategoryId) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getTasksByCategoryId) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getTasksByCategoryId) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getTasksByCategoryId) error : ", err);
                    return reject(err);
                });
            }
        );
    }

    getTasks(category : string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
        // GET /api/rainbow/enduser/v1.0/users/:userId/todos
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "category", category);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTasks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTasks) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTasks) error : ", err);
                return reject(err);
            });
        });
    }

    deletePropertiesFromCategoriesTasks(categoryId : string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategories
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/properties/" + categoryId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deletePropertiesFromCategoriesTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deletePropertiesFromCategoriesTasks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deletePropertiesFromCategoriesTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deletePropertiesFromCategoriesTasks) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTask(taskId : string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodo
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/" + taskId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTask) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTask) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCategoryFromTasks(categoryId : string) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategory
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/category/" + categoryId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCategoryFromTasks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCategoryFromTasks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCategoryFromTasks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCategoryFromTasks) error : ", err);
                return reject(err);
            });
        });
    }

    updateTask(taskId:string, task : TaskInput) {
        // API https://api.openrainbow.org/enduser/#api-to_do_list-updateTodo
        // URL PUT /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + that.userId + "/todos/" + taskId;
            let data: any = {};
            addPropertyToObj(data, "category", task.category, false);
            addPropertyToObj(data, "position", task.position, false);
            addPropertyToObj(data, "content", task.content, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTask) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTask) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Tasks MANAGEMENT

        //endregion Rainbow Voice Routing

    //region Rainbow APIs Settings

    getApisSettings() {
        // GET  https://api.openrainbow.org/api/rainbow/enduser/v1.0/settings/apis
        // API https://api.openrainbow.org/enduser/#api-settings_apis-getApisSettings
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/settings/apis";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "calleeId", calleeId );
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId );
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getApisSettings) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getApisSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getApisSettings) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getApisSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getApisSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow APIs Settings

}

export {RESTService, MEDIATYPE, GuestParams};
module.exports.RESTService = RESTService;
module.exports.MEDIATYPE = MEDIATYPE;
module.exports.GuestParams = GuestParams;
