"use strict";

import {jwtDecode} from "jwt-decode";
import * as btoa from "btoa";
//import * as CryptoJS from "crypto-js";

import * as backoff from "backoff";

import {
    addParamToUrl, addPropertyIfNotAlreadyExistToObj,
    addPropertyToObj,
    getRandomInt, isDefined,
    logEntryExit,
    makeId,
    msToTime, orderByFilter,
    stackTrace
} from "../common/Utils.js";
import {createPassword} from "../common/Utils.js";

import  {RESTTelephony} from "./RestServices/RESTTelephony";
import {HTTPService} from "./HttpService";
import {Contact} from "../common/models/Contact";
import EventEmitter = NodeJS.EventEmitter;
import {Logger} from "../common/Logger";
import {ROOMROLE, CHATSTATE} from "../services/S2SService";
import {Core} from "../Core";
import {ErrorManager} from "../common/ErrorManager";
import {RESTConferenceV2} from "./RestServices/RESTConferenceV2";
import {RESTWebinar} from "./RestServices/RESTWebinar";
import {RESTRoom} from "./RestServices/RESTRoom";
import {RESTPolls} from "./RestServices/RESTPolls";
import {RESTTasks} from "./RestServices/RESTTasks";
import {RESTAlerts} from "./RestServices/RESTAlerts";
import {RESTDirectory} from "./RestServices/RESTDirectory";
import {RESTCustomerCare} from "./RestServices/RESTCustomerCare";
import {RESTCalendar} from "./RestServices/RESTCalendar";
import {RESTChannels} from "./RestServices/RESTChannels";
import {RESTFileStorage} from "./RestServices/RESTFileStorage";
import {RESTSubscriptions} from "./RestServices/RESTSubscriptions";
import {RESTConversations} from "./RestServices/RESTConversations";
import {RESTAuth} from "./RestServices/RESTAuth";
import {RESTContacts} from "./RestServices/RESTContacts";
import {RESTApplications} from "./RestServices/RESTApplications";
import {RESTInvitations} from "./RestServices/RESTInvitations";
import {RESTGroups} from "./RestServices/RESTGroups";
import {RESTPresence} from "./RestServices/RESTPresence";
import {RESTBubbles} from "./RestServices/RESTBubbles";
import {RESTSettings} from "./RestServices/RESTSettings";
import {RESTCountry} from "./RestServices/RESTCountry";
import {RESTConnectors} from "./RestServices/RESTConnectors";
import {RESTBubbleOpenInvites} from "./RestServices/RESTBubbleOpenInvites";
import {RESTConference} from "./RestServices/RESTConference";
import {RESTBubblesTags} from "./RestServices/RESTBubblesTags";
import {RESTBubblesDialIn} from "./RestServices/RESTBubblesDialIn";
import {RESTProfiles} from "./RestServices/RESTProfiles";
import {RESTApiSettings} from "./RestServices/RESTApiSettings";
import {RESTBots} from "./RestServices/RESTBots";
import {RESTPublicUrl} from "./RestServices/RESTPublicUrl";
import {RESTClientsVersions} from "./RestServices/RESTClientsVersions";
import {RESTSites} from "./RestServices/RESTSites";
import {RESTCustomisationTemplate} from "./RestServices/RESTCustomisationTemplate";
import {RESTSystems} from "./RestServices/RESTSystems";
import {RESTS2S} from "./RestServices/RESTS2S";
import {RESTCompany} from "./RestServices/RESTCompany";
import {RESTAdLdap} from "./RestServices/RESTAdLdap";
import {RESTCloudPbx} from "./RestServices/RESTCloudPbx";
import {RESTRainbowVoice} from "./RestServices/RESTRainbowVoice";
import {GenericRESTService} from "./GenericRESTService";
import {TimeOutManager} from "../common/TimeOutManager";
import {Group} from "ts-generic-collections-linq";
import {Task} from "../common/models/Task.js";
import {TaskInput} from "../services/TasksService.js";
import {HuntingGroup} from "../common/models/RainbowVoiceCloudPBX.js";
import { PEERTYPE } from "../common/models/Conversation.js";

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
    }; //     User's custom data.

    public companyNameOfGuest: string; // A string represention the name of the company of the Guest (only an info property, the guests are created in the "Rainbow" company).

    public roomPassword: string; // Password of the bubble if required.
    
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
        _customData: any= null,
        _companyNameOfGuest:string = null,
        _roomPassword: string = null
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
        that.companyNameOfGuest = _companyNameOfGuest;
        that.roomPassword = _roomPassword;
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
        if (that.companyNameOfGuest) {
            param.companyNameOfGuest = that.companyNameOfGuest;
        }
        if (that.roomPassword) {
            param.roomPassword = that.roomPassword;
        }
        return param
    }

}

@logEntryExit(LOG_ID)
class RESTService extends GenericRESTService {
    public http: HTTPService;
    public _core: Core;
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
    public restRoom: RESTRoom;
    public restPolls: RESTPolls;
    public restTasks: RESTTasks;
    public restAlerts: RESTAlerts;
    public restDirectory: RESTDirectory;
    public restCustomerCare: RESTCustomerCare;
    public restCalendar: RESTCalendar;
    public restChannels: RESTChannels;
    public restFileStorage: RESTFileStorage;
    public restSubscriptions: RESTSubscriptions;
    public restConversations: RESTConversations;
    public restAuth: RESTAuth;
    public restContacts: RESTContacts;
    public restApplications: RESTApplications;
    public restInvitations: RESTInvitations;
    public restGroups: RESTGroups;
    public restPresence: RESTPresence;
    public restBubbles: RESTBubbles;
    public restSettings: RESTSettings;
    public restCountry: RESTCountry;
    public restConnectors: RESTConnectors;
    public restBubbleOpenInvites: RESTBubbleOpenInvites;
    public restConference: RESTConference;
    public restBubblesTags: RESTBubblesTags;
    public restBubblesDialIn: RESTBubblesDialIn;
    public restProfiles: RESTProfiles;
    public restApiSettings: RESTApiSettings;
    public restBots: RESTBots;
    public restPublicUrl: RESTPublicUrl;
    public restClientsVersions: RESTClientsVersions;
    public restSites: RESTSites;
    public restCustomisationTemplate: RESTCustomisationTemplate;
    public restSystems: RESTSystems;
    public restS2S: RESTS2S;
    public restCompany: RESTCompany;
    public restAdLdap: RESTAdLdap;
    public restCloudPbx: RESTCloudPbx;
    public restRainbowVoice: RESTRainbowVoice;
    public applicationToken: string;
    public connectionS2SInfo: any;
    private reconnectInProgress: boolean;
    private _options: any;
    protected apiConfigTTL: number = 1;
    protected apiConfigTTLTimeout: any = 1;
    protected loginUrl = '/api/rainbow/authentication/v1.0/login';
    protected logoutUrl = '/api/rainbow/authentication/v1.0/logout';


    static getClassName() { return 'RESTService'; }
    getClassName() { return RESTService.getClassName(); }

    static getAccessorName(){ return 'rest'; }
    getAccessorName(){ return RESTService.getAccessorName(); }

    constructor(core: Core, _options, evtEmitter: EventEmitter, _logger: Logger) {
        super(core, _logger, LOG_ID);
        let that = this;
        let self = this;
        this.eventEmitter = evtEmitter;

        this._logger = _logger;
        this.restTelephony = new RESTTelephony(core, evtEmitter, _logger);
        this.restConferenceV2 = new RESTConferenceV2(core, evtEmitter, _logger);
        this.restWebinar = new RESTWebinar(core, evtEmitter, _logger);
        this.restRoom = new RESTRoom(core, evtEmitter, _logger);
        this.restPolls = new RESTPolls(core, evtEmitter, _logger);
        this.restTasks = new RESTTasks(core, evtEmitter, _logger);
        this.restAlerts = new RESTAlerts(core, evtEmitter, _logger);
        this.restDirectory = new RESTDirectory(core, evtEmitter, _logger);
        this.restCustomerCare = new RESTCustomerCare(core, evtEmitter, _logger);
        this.restCalendar = new RESTCalendar(core, evtEmitter, _logger);
        this.restChannels = new RESTChannels(core, evtEmitter, _logger);
        this.restFileStorage = new RESTFileStorage(core, evtEmitter, _logger);
        this.restSubscriptions = new RESTSubscriptions(core, evtEmitter, _logger);
        this.restConversations = new RESTConversations(core, evtEmitter, _logger);
        this.restAuth = new RESTAuth(core, evtEmitter, _logger);
        this.restContacts = new RESTContacts(core, evtEmitter, _logger);
        this.restApplications = new RESTApplications(core, evtEmitter, _logger);
        this.restInvitations = new RESTInvitations(core, evtEmitter, _logger);
        this.restGroups = new RESTGroups(core, evtEmitter, _logger);
        this.restPresence = new RESTPresence(core, evtEmitter, _logger);
        this.restBubbles = new RESTBubbles(core, evtEmitter, _logger);
        this.restSettings = new RESTSettings(core, evtEmitter, _logger);
        this.restCountry = new RESTCountry(core, evtEmitter, _logger);
        this.restConnectors = new RESTConnectors(core, evtEmitter, _logger);
        this.restBubbleOpenInvites = new RESTBubbleOpenInvites(core, evtEmitter, _logger);
        this.restConference = new RESTConference(core, evtEmitter, _logger);
        this.restBubblesTags = new RESTBubblesTags(core, evtEmitter, _logger);
        this.restBubblesDialIn = new RESTBubblesDialIn(core, evtEmitter, _logger);
        this.restProfiles = new RESTProfiles(core, evtEmitter, _logger);
        this.restApiSettings = new RESTApiSettings(core, evtEmitter, _logger);
        this.restBots = new RESTBots(core, evtEmitter, _logger);
        this.restPublicUrl = new RESTPublicUrl(core, evtEmitter, _logger);
        this.restClientsVersions = new RESTClientsVersions(core, evtEmitter, _logger);
        this.restSites = new RESTSites(core, evtEmitter, _logger);
        this.restCustomisationTemplate = new RESTCustomisationTemplate(core, evtEmitter, _logger);
        this.restSystems = new RESTSystems(core, evtEmitter, _logger);
        this.restS2S = new RESTS2S(core, evtEmitter, _logger);
        this.restCompany = new RESTCompany(core, evtEmitter, _logger);
        this.restAdLdap = new RESTAdLdap(core, evtEmitter, _logger);
        this.restCloudPbx = new RESTCloudPbx(core, evtEmitter, _logger);
        this.restRainbowVoice = new RESTRainbowVoice(core, evtEmitter, _logger);
        //this.timeOutManager = core.timeOutManager;
        this.http = null;
        this.account = null;
        this.app = null;
        this.tokenRest = null;
        this.renewTokenInterval = null;
        this._options = _options;
        this.credentialsRest = _options.credentials;
        this.applicationRest = _options.applicationOptions;
        this.loginEmail = _options.credentials.login;
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

    async setCredentialPassword (strPassword : string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID +  "(setCredentialPassword) strPassword : ", strPassword);
        this._options.credentials.password = strPassword;
        this.credentialsRest = this._options.credentials;
        this.authRest = btoa(this.credentials.login + ":" + this.credentials.password);

    }

    get userId() {
        return this.account ? this.account.id:"";
    }

    getMockRestUrl() {
        return this.http.getMockRestUrl();
    }

    setMockRestUrl(mockRestUrl: Array<{verb:string, url : string, callback : any }>) {
        this.http.setMockRestUrl(mockRestUrl);
    }

    addMockRestUrl(verb: string, url: string, callback: any) {
        this.http.addMockRestUrl(verb, url, callback);
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
        prom.push(that.restRoom.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restRoom email used", that.loginEmail);
        }));
        prom.push(that.restPolls.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restPolls email used", that.loginEmail);
        }));
        prom.push(that.restTasks.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restTasks email used", that.loginEmail);
        }));
        prom.push(that.restAlerts.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restAlerts email used", that.loginEmail);
        }));
        prom.push(that.restDirectory.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restDirectory email used", that.loginEmail);
        }));
        prom.push(that.restCustomerCare.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCustomerCare email used", that.loginEmail);
        }));
        prom.push(that.restCalendar.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCalendar email used", that.loginEmail);
        }));
        prom.push(that.restChannels.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restChannels email used", that.loginEmail);
        }));
        prom.push(that.restFileStorage.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restFileStorage email used", that.loginEmail);
        }));
        prom.push(that.restSubscriptions.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restSubscriptions email used", that.loginEmail);
        }));
        prom.push(that.restConversations.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restConversations email used", that.loginEmail);
        }));
        prom.push(that.restAuth.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restAuth email used", that.loginEmail);
        }));
        prom.push(that.restContacts.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restContacts email used", that.loginEmail);
        }));
        prom.push(that.restApplications.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restApplications email used", that.loginEmail);
        }));
        prom.push(that.restInvitations.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restInvitations email used", that.loginEmail);
        }));
        prom.push(that.restGroups.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restGroups email used", that.loginEmail);
        }));
        prom.push(that.restPresence.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restPresence email used", that.loginEmail);
        }));
        prom.push(that.restBubbles.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restBubbles email used", that.loginEmail);
        }));
        prom.push(that.restSettings.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restSettings email used", that.loginEmail);
        }));
        prom.push(that.restCountry.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCountry email used", that.loginEmail);
        }));
        prom.push(that.restConnectors.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restConnectors email used", that.loginEmail);
        }));
        prom.push(that.restBubbleOpenInvites.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restBubbleOpenInvites email used", that.loginEmail);
        }));
        prom.push(that.restConference.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restConference email used", that.loginEmail);
        }));
        prom.push(that.restBubblesTags.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restBubblesTags email used", that.loginEmail);
        }));
        prom.push(that.restBubblesDialIn.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restBubblesDialIn email used", that.loginEmail);
        }));
        prom.push(that.restProfiles.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restProfiles email used", that.loginEmail);
        }));
        prom.push(that.restApiSettings.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restApiSettings email used", that.loginEmail);
        }));
        prom.push(that.restBots.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restBots email used", that.loginEmail);
        }));
        prom.push(that.restPublicUrl.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restPublicUrl email used", that.loginEmail);
        }));
        prom.push(that.restClientsVersions.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restClientsVersions email used", that.loginEmail);
        }));
        prom.push(that.restSites.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restSites email used", that.loginEmail);
        }));
        prom.push(that.restCustomisationTemplate.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCustomisationTemplate email used", that.loginEmail);
        }));
        prom.push(that.restSystems.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restSystems email used", that.loginEmail);
        }));
        prom.push(that.restS2S.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restS2S email used", that.loginEmail);
        }));
        prom.push(that.restCompany.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCompany email used", that.loginEmail);
        }));
        prom.push(that.restAdLdap.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restAdLdap email used", that.loginEmail);
        }));
        prom.push(that.restCloudPbx.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restCloudPbx email used", that.loginEmail);
        }));
        prom.push(that.restRainbowVoice.start(that.http).then(() => {
            that._logger.log(that.INTERNAL, LOG_ID + "(start) restRainbowVoice email used", that.loginEmail);
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

                await that.restRoom.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restRoom.");
                });

                await that.restPolls.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restPolls.");
                });

                await that.restTasks.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restTasks.");
                });

                await that.restAlerts.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restAlerts.");
                });

                await that.restDirectory.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restDirectory.");
                });

                await that.restCustomerCare.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCustomerCare.");
                });

                await that.restCalendar.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCalendar.");
                });

                await that.restChannels.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restChannels.");
                });

                await that.restFileStorage.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restFileStorage.");
                });

                await that.restSubscriptions.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restSubscriptions.");
                });

                await that.restConversations.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restConversations.");
                });

                await that.restAuth.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restAuth.");
                });

                await that.restContacts.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restContacts.");
                });
                await that.restApplications.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restApplications.");
                });
                await that.restInvitations.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restInvitations.");
                });
                await that.restGroups.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restGroups.");
                });
                await that.restPresence.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restPresence.");
                });
                await that.restBubbles.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restBubbles.");
                });
                await that.restSettings.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restSettings.");
                });
                await that.restCountry.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCountry.");
                });
                await that.restConnectors.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restConnectors.");
                });
                await that.restBubbleOpenInvites.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restBubbleOpenInvites.");
                });
                await that.restConference.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restConference.");
                });
                await that.restBubblesTags.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restBubblesTags.");
                });
                await that.restBubblesDialIn.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restBubblesDialIn.");
                });
                await that.restProfiles.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restProfiles.");
                });
                await that.restApiSettings.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restApiSettings.");
                });
                await that.restBots.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restBots.");
                });
                await that.restPublicUrl.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restPublicUrl.");
                });
                await that.restClientsVersions.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restClientsVersions.");
                });
                await that.restSites.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restSites.");
                });
                await that.restCustomisationTemplate.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCustomisationTemplate.");
                });
                await that.restSystems.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restSystems.");
                });
                await that.restS2S.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restS2S.");
                });
                await that.restCompany.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCompany.");
                });
                await that.restAdLdap.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restAdLdap.");
                });
                await that.restCloudPbx.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restCloudPbx.");
                });
                await that.restRainbowVoice.stop().then(() => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(stop) restRainbowVoice.");
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
        return new Promise(async function (resolve, reject) {
            if (that.isUserCredentialsLogin()) {

                that.getAuthenticationUrls({"country": undefined, "uiLocales": undefined, "useBackchannelPolling": false, "uid" : that.loginEmail}).then(async function (urls : any) {
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) getAuthenticationUrls : ", urls);
                    that.loginUrl = urls.loginUrl ? new URL(urls.loginUrl).pathname : '/api/rainbow/authentication/v1.0/login';
                    that.logoutUrl = urls.logoutUrl ? new URL(urls.logoutUrl).pathname : '/api/rainbow/authentication/v1.0/logout';
                }).catch(function (err) {
                    /*that._logger.log(that.ERROR, LOG_ID, "(signin) ErrorManager during REST signin");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(signin) ErrorManager during REST signin : ", err);
                    return reject(err);
                    // */
                    that.loginUrl = '/api/rainbow/authentication/v1.0/login';
                    that.logoutUrl = '/api/rainbow/authentication/v1.0/logout';
                });

                that.http.get(that.loginUrl, that.getLoginHeader(), undefined).then(async function (JSON) {
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

            } else if (that.isAPIKeyCredentialsLogin()) {
                let myInformations: any = await that.getMyInformations();
                that._logger.log(that.INTERNAL, LOG_ID + "(signin) myInformations : ", myInformations);
                let JSON : any = {};
                JSON.loggedInUser = myInformations;
                that.account = JSON.loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid:that.account.jid_im;
                await that.getApplicationDataById(that.application.appID).then((applicationData) => {
                    JSON.loggedInApplication = applicationData;
                    that.app = JSON.loggedInApplication;
                }).catch ( (error) => {
                    that._logger.log(that.WARN, LOG_ID + "(signin) getApplicationDataById failed : ", error);
                })
                //that.tokenRest = JSON.token;

                await that.getAuthenticationUrls({"country": undefined, "uiLocales": undefined, "useBackchannelPolling": false, "uid" : myInformations.loginEmail}).then(async function (urls : any) {
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) getAuthenticationUrls : ", urls);

                    that.loginUrl = urls.loginUrl ? new URL(urls.loginUrl).pathname:'/api/rainbow/authentication/v1.0/login';
                    that.logoutUrl = urls.logoutUrl ? new URL(urls.logoutUrl).pathname:'/api/rainbow/authentication/v1.0/logout';

                });

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

                /*
                let loggedInUser = await that.getContactInformationByID(decodedtoken.user.id).then(async (contactsFromServeur: any) => {
                    if (contactsFromServeur) {

                    }
                }); // */
                return resolve(that.account);
            } else {
                //throw new Error("Error, no credentials defined. You must define a couple of login/password or define an apikey");
                reject({"message":"Error, no credentials defined. You must define a couple of login/password or define an apikey"});
            }
        });
    }

    set tokenRest(value: any) {
        this._token = value;
        this.restConferenceV2.p_token = value;
        this.restWebinar.p_token = value;
        this.restRoom.p_token = value;
        this.restPolls.p_token = value;
        this.restTasks.p_token = value;
        this.restAlerts.p_token = value;
        this.restDirectory.p_token = value;
        this.restCustomerCare.p_token = value;
        this.restCalendar.p_token = value;
        this.restChannels.p_token = value;
        this.restFileStorage.p_token = value;
        this.restSubscriptions.p_token = value;
        this.restConversations.p_token = value;
        this.restAuth.p_token = value;
        this.restContacts.p_token = value;
        this.restApplications.p_token = value;
        this.restInvitations.p_token = value;
        this.restGroups.p_token = value;
        this.restPresence.p_token = value;
        this.restBubbles.p_token = value;
        this.restSettings.p_token = value;
        this.restCountry.p_token = value;
        this.restConnectors.p_token = value;
        this.restBubbleOpenInvites.p_token = value;
        this.restConference.p_token = value;
        this.restBubblesTags.p_token = value;
        this.restBubblesDialIn.p_token = value;
        this.restProfiles.p_token = value;
        this.restApiSettings.p_token = value;
        this.restBots.p_token = value;
        this.restPublicUrl.p_token = value;
        this.restClientsVersions.p_token = value;
        this.restSites.p_token = value;
        this.restCustomisationTemplate.p_token = value;
        this.restSystems.p_token = value;
        this.restS2S.p_token = value;
        this.restCompany.p_token = value;
        this.restAdLdap.p_token = value;
        this.restCloudPbx.p_token = value;
        this.restRainbowVoice.p_token = value;
    }

    set decodedtokenRest(value: any) {
        this._decodedtokenRest = value;
        this.restConferenceV2.p_decodedtokenRest = value;
        this.restWebinar.p_decodedtokenRest = value;
        this.restRoom.p_decodedtokenRest = value;
        this.restPolls.p_decodedtokenRest = value;
        this.restTasks.p_decodedtokenRest = value;
        this.restAlerts.p_decodedtokenRest = value;
        this.restDirectory.p_decodedtokenRest = value;
        this.restCustomerCare.p_decodedtokenRest = value;
        this.restCalendar.p_decodedtokenRest = value;
        this.restChannels.p_decodedtokenRest = value;
        this.restFileStorage.p_decodedtokenRest = value;
        this.restSubscriptions.p_decodedtokenRest = value;
        this.restConversations.p_decodedtokenRest = value;
        this.restAuth.p_decodedtokenRest = value;
        this.restContacts.p_decodedtokenRest = value;
        this.restApplications.p_decodedtokenRest = value;
        this.restInvitations.p_decodedtokenRest = value;
        this.restGroups.p_decodedtokenRest = value;
        this.restPresence.p_decodedtokenRest = value;
        this.restBubbles.p_decodedtokenRest = value;
        this.restSettings.p_decodedtokenRest = value;
        this.restCountry.p_decodedtokenRest = value;
        this.restConnectors.p_decodedtokenRest = value;
        this.restBubbleOpenInvites.p_decodedtokenRest = value;
        this.restConference.p_decodedtokenRest = value;
        this.restBubblesTags.p_decodedtokenRest = value;
        this.restBubblesDialIn.p_decodedtokenRest = value;
        this.restProfiles.p_decodedtokenRest = value;
        this.restApiSettings.p_decodedtokenRest = value;
        this.restBots.p_decodedtokenRest = value;
        this.restPublicUrl.p_decodedtokenRest = value;
        this.restClientsVersions.p_decodedtokenRest = value;
        this.restSites.p_decodedtokenRest = value;
        this.restCustomisationTemplate.p_decodedtokenRest = value;
        this.restSystems.p_decodedtokenRest = value;
        this.restS2S.p_decodedtokenRest = value;
        this.restCompany.p_decodedtokenRest = value;
        this.restAdLdap.p_decodedtokenRest = value;
        this.restCloudPbx.p_decodedtokenRest = value;
        this.restRainbowVoice.p_decodedtokenRest = value;
    }

    set credentialsRest(value: any) {
        this._credentials = value;
        this.restConferenceV2.p_credentials = value;
        this.restWebinar.p_credentials = value;
        this.restRoom.p_credentials = value;
        this.restPolls.p_credentials = value;
        this.restTasks.p_credentials = value;
        this.restAlerts.p_credentials = value;
        this.restDirectory.p_credentials = value;
        this.restCustomerCare.p_credentials = value;
        this.restCalendar.p_credentials = value;
        this.restChannels.p_credentials = value;
        this.restFileStorage.p_credentials = value;
        this.restSubscriptions.p_credentials = value;
        this.restConversations.p_credentials = value;
        this.restAuth.p_credentials = value;
        this.restContacts.p_credentials = value;
        this.restApplications.p_credentials = value;
        this.restInvitations.p_credentials = value;
        this.restGroups.p_credentials = value;
        this.restPresence.p_credentials = value;
        this.restBubbles.p_credentials = value;
        this.restSettings.p_credentials = value;
        this.restCountry.p_credentials = value;
        this.restConnectors.p_credentials = value;
        this.restBubbleOpenInvites.p_credentials = value;
        this.restConference.p_credentials = value;
        this.restBubblesTags.p_credentials = value;
        this.restBubblesDialIn.p_credentials = value;
        this.restProfiles.p_credentials = value;
        this.restApiSettings.p_credentials = value;
        this.restBots.p_credentials = value;
        this.restPublicUrl.p_credentials = value;
        this.restClientsVersions.p_credentials = value;
        this.restSites.p_credentials = value;
        this.restCustomisationTemplate.p_credentials = value;
        this.restSystems.p_credentials = value;
        this.restS2S.p_credentials = value;
        this.restCompany.p_credentials = value;
        this.restAdLdap.p_credentials = value;
        this.restCloudPbx.p_credentials = value;
        this.restRainbowVoice.p_credentials = value;
    }

    set applicationRest(value: any) {
        this._application = value;
        this.restConferenceV2.p_application = value;
        this.restWebinar.p_application = value;
        this.restRoom.p_application = value;
        this.restPolls.p_application = value;
        this.restTasks.p_application = value;
        this.restAlerts.p_application = value;
        this.restDirectory.p_application = value;
        this.restCustomerCare.p_application = value;
        this.restCalendar.p_application = value;
        this.restChannels.p_application = value;
        this.restFileStorage.p_application = value;
        this.restSubscriptions.p_application = value;
        this.restConversations.p_application = value;
        this.restAuth.p_application = value;
        this.restContacts.p_application = value;
        this.restApplications.p_application = value;
        this.restInvitations.p_application = value;
        this.restGroups.p_application = value;
        this.restPresence.p_application = value;
        this.restBubbles.p_application = value;
        this.restSettings.p_application = value;
        this.restCountry.p_application = value;
        this.restConnectors.p_application = value;
        this.restBubbleOpenInvites.p_application = value;
        this.restConference.p_application = value;
        this.restBubblesTags.p_application = value;
        this.restBubblesDialIn.p_application = value;
        this.restProfiles.p_application = value;
        this.restApiSettings.p_application = value;
        this.restBots.p_application = value;
        this.restPublicUrl.p_application = value;
        this.restClientsVersions.p_application = value;
        this.restSites.p_application = value;
        this.restCustomisationTemplate.p_application = value;
        this.restSystems.p_application = value;
        this.restS2S.p_application = value;
        this.restCompany.p_application = value;
        this.restAdLdap.p_application = value;
        this.restCloudPbx.p_application = value;
        this.restRainbowVoice.p_application = value;
    }

    set authRest(value: any) {
        this._auth = value;
        this.restConferenceV2.p_auth = value;
        this.restWebinar.p_auth = value;
        this.restRoom.p_auth = value;
        this.restPolls.p_auth = value;
        this.restTasks.p_auth = value;
        this.restAlerts.p_auth = value;
        this.restDirectory.p_auth = value;
        this.restCustomerCare.p_auth = value;
        this.restCalendar.p_auth = value;
        this.restChannels.p_auth = value;
        this.restFileStorage.p_auth = value;
        this.restSubscriptions.p_auth = value;
        this.restConversations.p_auth = value;
        this.restAuth.p_auth = value;
        this.restContacts.p_auth = value;
        this.restApplications.p_auth = value;
        this.restInvitations.p_auth = value;
        this.restGroups.p_auth = value;
        this.restPresence.p_auth = value;
        this.restBubbles.p_auth = value;
        this.restSettings.p_auth = value;
        this.restCountry.p_auth = value;
        this.restConnectors.p_auth = value;
        this.restBubbleOpenInvites.p_auth = value;
        this.restConference.p_auth = value;
        this.restBubblesTags.p_auth = value;
        this.restBubblesDialIn.p_auth = value;
        this.restProfiles.p_auth = value;
        this.restApiSettings.p_auth = value;
        this.restBots.p_auth = value;
        this.restPublicUrl.p_auth = value;
        this.restClientsVersions.p_auth = value;
        this.restSites.p_auth = value;
        this.restCustomisationTemplate.p_auth = value;
        this.restSystems.p_auth = value;
        this.restS2S.p_auth = value;
        this.restCompany.p_auth = value;
        this.restAdLdap.p_auth = value;
        this.restCloudPbx.p_auth = value;
        this.restRainbowVoice.p_auth = value;
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

                that.apiConfigTTL = (apiSettings?.ttl > 10) ? (apiSettings?.ttl - 5) : (apiSettings?.ttl - 1);
                if (that.apiConfigTTL) {
                    that.apiConfigTTLTimeout = setTimeout(() => {
                        that.apiConfigTTL = 0;
                        that.getApiConfigurationFromServer();
                    }, that.apiConfigTTL  * 1000 * 60);
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
            if (that.isAPIKeyCredentialsLogin()) {
                //that._logger.log(that.DEBUG, LOG_ID + "(signout) APIKey Login, so ignore REST signed-out!");
                resolve(null);
            } else if (that.http ) {
                //that.http.get("/api/rainbow/authentication/v1.0/logout", that.getRequestHeader(), undefined).then(function (JSON) {
                that.http.get(that.logoutUrl, that.getRequestHeader(), undefined).then(function (JSON) {
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

        if (that.isAPIKeyCredentialsLogin()) {
            that._logger.log(that.INFO, LOG_ID + "(startTokenSurvey) - API_KEY used for log, so no token survey has to be done.");

            return;
        }

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
                    that.timeOutManager.clearTimeoutById(that.renewTokenInterval);
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
                    that.timeOutManager.clearTimeoutById(that.renewTokenInterval);
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
                    that.timeOutManager.clearTimeoutById(that.renewTokenInterval);
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
            that.timeOutManager.clearTimeoutById(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.eventEmitter.emit("evt_internal_tokenexpired");
        });
    }

    //region Bots
    // API https://api.openrainbow.org/enduser/#api-bots-getRainbowSupport
    // GET /api/rainbow/enduser/v1.0/bots/rainbow-support
    getRainbowSupportBotService() { return this.restBots.getRainbowSupportBotService(); }
    // API https://api.openrainbow.org/enduser/#api-bots-getBotById
    // GET /api/rainbow/enduser/v1.0/bots/:botId
    getABotServiceData(botId: string) { return this.restBots.getABotServiceData(botId); }
    // API https://api.openrainbow.org/enduser/#api-bots-getBots
    // GET /api/rainbow/enduser/v1.0/bots
    getAllBotServices(format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restBots.getAllBotServices(format, limit, offset, sortField, sortOrder); }
    //endregion

    //region apikeys rainbow authentication
    // API https://api.openrainbow.org/authentication/#api-apikeys-DeleteApiKey
    // DELETE /api/rainbow/authentication/v1.0/apikeys/:apiKeyId
    deleteApiKey(apiKeyId: string) { return this.restAuth.deleteApiKey(apiKeyId); }
    // API https://api.openrainbow.org/authentication/#api-apikeys-PostApiKeys
    // POST /api/rainbow/authentication/v1.0/apikeys
    generateApiKey(scope: Array<string> = ["all"], description: string = "", isActive: boolean = true, expirationDate?: string) { return this.restAuth.generateApiKey(scope, description, isActive, expirationDate); }
    // API https://api.openrainbow.org/authentication/#api-apikeys-GetAllApiKeys
    // GET /api/rainbow/authentication/v1.0/apikeys
    getAllApiKey(isActive: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined, limit: number = 100, offset: number = 0, sortField: string = "creationDate", sortOrder: number = -1, format: string = "small", userId: string) { return this.restAuth.getAllApiKey(isActive, fromCreationDate, toCreationDate, limit, offset, sortField, sortOrder, format, userId); }
    // API https://api.openrainbow.org/authentication/#api-apikeys-GetAnApiKey
    // GET /api/rainbow/authentication/v1.0/apikeys/:apiKeyId
    getApiKey(apiKeyId: string = undefined) { return this.restAuth.getApiKey(apiKeyId); }
    // API https://api.openrainbow.org/authentication/#api-apikeys-GetCurrentApiKey
    // GET /api/rainbow/authentication/v1.0/apikeys/current
    getCurrentApiKey(apiKeyId: string = undefined) { return this.restAuth.getCurrentApiKey(apiKeyId); }
    // API https://api.openrainbow.org/authentication/#api-apikeys-PutApiKeys
    // PUT /api/rainbow/authentication/v1.0/apikeys/:apiKeyId
    updateApiKey(apiKeyId: string, description: string, isActive: boolean, expirationDate: string = undefined) { return this.restAuth.updateApiKey(apiKeyId, description, isActive, expirationDate); }
    //endregion apikeys rainbow authentication

    //region multifactor rainbow authentication
    // DELETE /api/rainbow/enduser/v1.0/users/:accountId/mfa/trusted/:appId
    deleteTrustedApplication(appId: string) { return this.restAuth.deleteTrustedApplication(this.account?.id, appId); }
    // DELETE /api/rainbow/enduser/v1.0/users/:accountId/mfa/trusted
    deleteAllTrustedApplications() { return this.restAuth.deleteAllTrustedApplications(this.account?.id); }
    // DELETE /api/rainbow/enduser/v1.0/users/:accountId/mfa
    disableMultifactorAuthentication() { return this.restAuth.disableMultifactorAuthentication(this.account?.id); }
    // PUT /api/rainbow/enduser/v1.0/users/:accountId/mfa
    enableMultifactorAuthentication() { return this.restAuth.enableMultifactorAuthentication(this.account?.id); }
    // GET /api/rainbow/enduser/v1.0/users/:accountId/mfa
    getMultifactorInformation() { return this.restAuth.getMultifactorInformation(this.account?.id); }
    // POST /api/rainbow/enduser/v1.0/users/:accountId/mfa/verify
    verifyMultifactorInformation(token) { return this.restAuth.verifyMultifactorInformation(this.account?.id, token); }
    // DELETE /api/rainbow/enduser/v1.0/users/:accountId/mfa/recovery
    resetRecoveryCodeForMultifactorAuthentication() { return this.restAuth.resetRecoveryCodeForMultifactorAuthentication(this.account?.id); }
    //endregion multifactor rainbow authentication

    //region Contacts API

    //region Contacts API - Search portal
    // API https://api.openrainbow.org/search/#api-phonebook-search_alldirectories_by_GET
    // GET /api/rainbow/search/v1.0/alldirectories
    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format: string = "small", limit: number = 100, offset?: number, sortField: string = "reverseDisplayName", sortOrder: number = 1) { return this.restContacts.searchInAlldirectories(pbxId, systemId, numberE164, shortnumber, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/search/#api-phonebook-search_phonebooks_by_GET
    // GET /api/rainbow/search/v1.0/phonebooks
    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number) { return this.restContacts.searchInPhonebook(pbxId, name, number, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/search/#api-users-search_phone-numbers_users
    // GET /api/rainbow/search/v1.0/phone-numbers/:number/users
    searchUserByPhonenumber(number: string) { return this.restContacts.searchUserByPhonenumber(number); }
    // API https://api.openrainbow.org/search/#api-users-SearchUsers
    // GET /api/rainbow/search/v1.0/users
    searchUsers(limit: number = 20, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder: number = 1) { return this.restContacts.searchUsers(limit, displayName, search, companyId, excludeCompanyId, offset, sortField, sortOrder); }
    //endregion Contacts API - Search portal

    //region Sources
    // API https://api.openrainbow.org/enduser/#api-sources-createSource
    // POST /api/rainbow/enduser/v1.0/users/:userId/sources
    createSource(userId: string, sourceId: string, os: string) { return this.restContacts.createSource(this.account?.id, userId, sourceId, os); }
    // API https://api.openrainbow.org/enduser/#api-sources-deleteSource
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId
    deleteSource(userId: string, sourceId: string) { return this.restContacts.deleteSource(this.account?.id, userId, sourceId); }
    // API https://api.openrainbow.org/enduser/#api-sources-getSourceData
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId
    getSourceData(userId: string, sourceId: string) { return this.restContacts.getSourceData(this.account?.id, userId, sourceId); }
    // API https://api.openrainbow.org/enduser/#api-sources-getAllSourcesByUserId
    // GET /api/rainbow/enduser/v1.0/users/:userId/sources
    getAllSourcesByUserId(userId: string, format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1) { return this.restContacts.getAllSourcesByUserId(this.account?.id, userId, format, sortField, limit, offset, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-sources-updateSourceData
    // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId
    updateSourceData(userId: string, sourceId: string, os: string) { return this.restContacts.updateSourceData(this.account?.id, userId, sourceId, os); }
    // API https://api.openrainbow.org/enduser/#api-contacts-updateContact
    // PUT /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId
    updateContactData(userId: string, sourceId: string, contactIddb: string, contactId: string = undefined, firstName: string = undefined, lastName: string = undefined, displayName: string = undefined, company: string = undefined, jobTitle: string = undefined, phoneNumbers: Array<any> = undefined, emails: Array<any> = undefined, addresses: Array<any> = undefined, groups: Array<string> = undefined, otherData: Array<any> = undefined) { return this.restContacts.updateContactData(this.account?.id, userId, sourceId, contactIddb, contactId, firstName, lastName, displayName, company, jobTitle, phoneNumbers, emails, addresses, groups, otherData); }
    // API https://api.openrainbow.org/enduser/#api-contacts-createContact
    // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts
    createContact(userId: string, sourceId: string, contactId: string, firstName: string, lastName: string, displayName: string, company: string, jobTitle: string, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) { return this.restContacts.createContact(this.account?.id, userId, sourceId, contactId, firstName, lastName, displayName, company, jobTitle, phoneNumbers, emails, addresses, groups, otherData); }
    // API https://api.openrainbow.org/enduser/#api-contacts-getContact
    // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId
    getContactData(userId: string, sourceId: string, contactId: string) { return this.restContacts.getContactData(userId, sourceId, contactId); }
    // API https://api.openrainbow.org/enduser/#api-contacts-getContacts
    // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts
    getContactsList(userId: string, sourceId: string, format: string = "small") { return this.restContacts.getContactsList(userId, sourceId, format); }
    // API https://api.openrainbow.org/enduser/#api-contacts_deleteContact-DeleteApiRainbowEnduserV10UsersUseridSourcesSourceidContactsContactid
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId
    deleteContact(userId: string, sourceId: string, contactId: string) { return this.restContacts.deleteContact(this.account?.id, userId, sourceId, contactId); }
    //endregion Sources

    //region Contacts API - Enduser portal
    // GET /api/rainbow/admin/v1.0/users?format=
    getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId?: string, searchEmail?: string) { return this.restContacts.getAllUsers(format, offset, limit, sortField, companyId, searchEmail, this.account?.companyId); }
    // GET /api/rainbow/admin/v1.0/users
    getAllUsersByFilter(phoneNumbers: number, phoneNumber: number = undefined, searchEmail: string = undefined, companyId: string = undefined, roles: string = "user", excludeRoles: string = undefined, tags: string = undefined, departments: string = undefined, isTerminated: string = "false", isActivated: string = undefined, fileSharingCustomisation: string = undefined, userTitleNameCustomisation: string = undefined, softphoneOnlyCustomisation: string = undefined, useRoomCustomisation: string = undefined, phoneMeetingCustomisation: string = undefined, useChannelCustomisation: string = undefined, useScreenSharingCustomisation: string = undefined, useWebRTCVideoCustomisation: string = undefined, useWebRTCAudioCustomisation: string = undefined, instantMessagesCustomisation: string = undefined, userProfileCustomisation: string = undefined, fileStorageCustomisation: string = undefined, overridePresenceCustomisation: string = undefined, alert: string = undefined, changeTelephonyCustomisation: string = undefined, changeSettingsCustomisation: string = undefined, recordingConversationCustomisation: string = undefined, useGifCustomisation: string = undefined, useDialOutCustomisation: string = undefined, fileCopyCustomisation: string = undefined, fileTransferCustomisation: string = undefined, forbidFileOwnerChangeCustomisation: string = undefined, readReceiptsCustomisation: string = undefined, useSpeakingTimeStatistics: string = undefined, selectedAppCustomisationTemplate: string = undefined, format: string = undefined, limit: string = undefined, offset: string = undefined, sortField: string = undefined, sortOrder: string = undefined, displayName: string = undefined, useEmails: boolean = undefined, companyName: string = undefined, loginEmail: string = undefined, email: string = undefined, visibility: string = undefined, organisationId: string = undefined, siteId: string = undefined, jid_im: string = undefined, jid_tel: string = undefined) { return this.restContacts.getAllUsersByFilter(phoneNumbers, phoneNumber, searchEmail, companyId, roles, excludeRoles, tags, departments, isTerminated, isActivated, fileSharingCustomisation, userTitleNameCustomisation, softphoneOnlyCustomisation, useRoomCustomisation, phoneMeetingCustomisation, useChannelCustomisation, useScreenSharingCustomisation, useWebRTCVideoCustomisation, useWebRTCAudioCustomisation, instantMessagesCustomisation, userProfileCustomisation, fileStorageCustomisation, overridePresenceCustomisation, alert, changeTelephonyCustomisation, changeSettingsCustomisation, recordingConversationCustomisation, useGifCustomisation, useDialOutCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics, selectedAppCustomisationTemplate, format, limit, offset, sortField, sortOrder, displayName, useEmails, companyName, loginEmail, email, visibility, organisationId, siteId, jid_im, jid_tel); }
    // GET /api/rainbow/admin/v1.0/users/
    getContactInfos(userId) { return this.restContacts.getContactInfos(userId); }
    // PUT /api/rainbow/admin/v1.0/users/
    putContactInfos(userId, infos) { return this.restContacts.putContactInfos(userId, infos); }
    // API https://api.openrainbow.org/enduser/#api-users-getUserNetwork
    // GET /api/rainbow/enduser/v1.0/users/networks?format=full
    getContacts() { return this.restContacts.getContacts(); }
    // DELETE /api/rainbow/enduser/v1.0/users/networks/
    removeContactFromRoster(dbId) { return this.restContacts.removeContactFromRoster(dbId); }
    // GET /api/rainbow/enduser/v1.0/users/jids/
    getContactInformationByJID(jid) { return this.restContacts.getContactInformationByJID(jid); }
    // GET /api/rainbow/enduser/v1.0/users/
    getContactInformationByID(id) { return this.restContacts.getContactInformationByID(id); }
    // GET /api/rainbow/enduser/v1.0/users/me
    getMyInformations() { return this.restContacts.getMyInformations(); }
    // API https://api.openrainbow.org/enduser/#api-users-searchUsersByJids
    // POST /api/rainbow/enduser/v1.0/users/jids
    getContactsInformationByJIDs(jid_im: Array<string>, sortOrder: number = 1) { return this.restContacts.getContactsInformationByJIDs(jid_im, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-users-searchUsersByIds
    // POST /api/rainbow/enduser/v1.0/users/ids
    getContactsInformationByIds(ids: Array<string>, sortOrder: number = 1) { return this.restContacts.getContactsInformationByIds(ids, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-users-getUsersByloginEmails
    // POST /api/rainbow/admin/v1.0/users
    getContactInformationByLoginEmail(email, sortOrder: number = 1, limit: number = 100, offset: number = 0) { return this.restContacts.getContactInformationByLoginEmail(email, sortOrder, limit, offset); }

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


    // API https://api.openrainbow.org/admin/#api-users-PostUsers
    // POST /api/rainbow/admin/v1.0/users
    createUser(sendInvitationEmail: boolean = false, doNotAssignPaidLicense: boolean = false, mandatoryDefaultSubscription: boolean = false, companyId: string = undefined, loginEmail: string = undefined, customData: any = undefined, password: string = undefined, firstName: string = undefined, lastName: string = undefined, nickName: string = undefined, title: string = undefined, jobTitle: string = undefined, department: string = undefined, tags: Array<string> = undefined, emails: Array<any> = undefined, phoneNumbers: Array<any> = undefined, country: string = undefined, state: string = undefined, language: string = undefined, timezone: string = undefined, accountType: string = "free", roles: Array<string> = ["user"], adminType: string = undefined, isActive: boolean = true, isInitialized: boolean = false, visibility: string = undefined, timeToLive: number = -1, authenticationType: string = undefined, authenticationExternalUid: string = undefined, userInfo1: string = undefined, selectedTheme: string = undefined, userInfo2: string = undefined, isAdmin: boolean = false) { return this.restContacts.createUser(sendInvitationEmail, doNotAssignPaidLicense, mandatoryDefaultSubscription, companyId, loginEmail, customData, password, firstName, lastName, nickName, title, jobTitle, department, tags, emails, phoneNumbers, country, state, language, timezone, accountType, roles, adminType, isActive, isInitialized, visibility, timeToLive, authenticationType, authenticationExternalUid, userInfo1, selectedTheme, userInfo2, isAdmin); }
    // POST /api/rainbow/admin/v1.0/users
    createGuestUser(firstname, lastname, language, timeToLive) { return this.restContacts.createGuestUser(firstname, lastname, language, timeToLive, this.application?.appID, this.account?.companyId); }
    // GET /api/rainbow/authentication/v1.0/urls
    getAuthenticationUrls(params: {uid:string, country: string, uiLocales: string, useBackchannelPolling: boolean}) { return this.restContacts.getAuthenticationUrls(params); }
    // POST /api/rainbow/enduser/v1.0/notifications/emails/self-register
    registerUserByEmailFirstStep(userInfo: {"email":string,"lang":string}) { return this.restContacts.registerUserByEmailFirstStep(userInfo); }
    // PUT /api/rainbow/admin/v1.0/users/
    registerUserByEmailSecondStepWithToken(userLoginInfo: {"loginEmail":string,"password":string,"temporaryToken":string}) { return this.restContacts.registerUserByEmailSecondStepWithToken(userLoginInfo); }
    // PUT /api/rainbow/admin/v1.0/users/
    sendMessageNotification(data: any) { return this.restContacts.sendMessageNotification(data); }
    // PUT /api/rainbow/admin/v1.0/users/
    changePassword(password, userId) { return this.restContacts.changePassword(password, userId); }
    // PUT /api/rainbow/admin/v1.0/users/
    updateInformation(objData, userId) { return this.restContacts.updateInformation(objData, userId); }
    // DELETE /api/rainbow/admin/v1.0/users/
    deleteUser(userId) { return this.restContacts.deleteUser(userId); }
    // GET /api/rainbow/admin/v1.0/users/{userId}/external-presence
    getUserExternalPresence(userId) { return this.restContacts.getUserExternalPresence(userId); }
    // PUT /api/rainbow/admin/v1.0/users/{userId}/external-presence
    updateUserExternalPresence(userId, externalPresence) { return this.restContacts.updateUserExternalPresence(userId, externalPresence); }
    // DELETE /api/rainbow/admin/v1.0/users/{userId}/external-presence
    deleteUserExternalPresence(userId) { return this.restContacts.deleteUserExternalPresence(userId); }
    // GET /api/rainbow/enduser/v1.0/users/{userId}/custom-status
    getCustomStatus(userId) { return this.restContacts.getCustomStatus(userId); }
    // POST /api/rainbow/enduser/v1.0/users/{userId}/custom-status
    setCustomStatus(userId: string, customStatus: string, emoji: string, expirationDate: string) { return this.restContacts.setCustomStatus(userId, customStatus, emoji, expirationDate); }
    // DELETE /api/rainbow/enduser/v1.0/users/{userId}/custom-status
    deleteCustomStatus(userId) { return this.restContacts.deleteCustomStatus(userId); }
    // URL PUT /api/rainbow/enduser/v1.0/users/:userId
    updateEndUserInformations(userId, objData) { return this.restContacts.updateEndUserInformations(userId, objData); }
    //endregion Contacts API - Enduser portal

    //region Enduser Themes API
    // GET /api/rainbow/enduser/v1.0/themes
    getThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) { return this.restContacts.getThemes(format, variant, limit, offset, sortField, sortOrder, name); }
    // GET /api/rainbow/enduser/v1.0/users/:userId/themes
    getUserThemes(userId, selectedThemeObj = false, variant = undefined) { return this.restContacts.getUserThemes(userId, selectedThemeObj, variant); }
    // PUT /api/rainbow/enduser/v1.0/users/:userId/themes/:themeId
    setUserTheme(userId, themeId, variant = undefined) { return this.restContacts.setUserTheme(userId, themeId, variant); }
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/themes
    deleteUserThemes(userId, variant = undefined) { return this.restContacts.deleteUserThemes(userId, variant); }
    //endregion Enduser Themes API

    //region Admin Themes API
    // GET /api/rainbow/admin/v1.0/themes
    getAdminThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) { return this.restContacts.getAdminThemes(format, variant, limit, offset, sortField, sortOrder, name); }
    // GET /api/rainbow/admin/v1.0/companies/:companyId/themes
    getCompanyThemes(companyId, selectedThemeObj = false, variant = undefined) { return this.restContacts.getCompanyThemes(companyId, selectedThemeObj, variant); }
    // POST /api/rainbow/admin/v1.0/companies/:companyId/themes
    createCompanyTheme(companyId, name, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) { return this.restContacts.createCompanyTheme(companyId, name, variant, description, isPublic, visibleBy, data); }
    // PUT /api/rainbow/admin/v1.0/companies/:companyId/themes/:themeId
    updateCompanyTheme(companyId, themeId, name = undefined, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) { return this.restContacts.updateCompanyTheme(companyId, themeId, name, variant, description, isPublic, visibleBy, data); }
    // DELETE /api/rainbow/admin/v1.0/companies/:companyId/themes/:themeId
    deleteCompanyTheme(companyId, themeId) { return this.restContacts.deleteCompanyTheme(companyId, themeId); }
    //endregion Admin Themes API

    //endregion Contacts API

    //region Applications
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_blockApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/block
    blockApplication(applicationId, reason) { return this.restApplications.blockApplication(applicationId, reason); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_postApps
    // POST /api/rainbow/applications/v1.0/applications
    createApplication(name, platform, ownerId, isPublished, appKeyOnly, appKeyAndSecret, appKeyAndSecretAndJwt, appKeyAndJwtSecret, appKeyAndJwtAndSecret, appKeyAndJwtAndSecretAndRedirectUri) { return this.restApplications.createApplication(name, platform, ownerId, isPublished, appKeyOnly, appKeyAndSecret, appKeyAndSecretAndJwt, appKeyAndJwtSecret, appKeyAndJwtAndSecret, appKeyAndJwtAndSecretAndRedirectUri); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_declineAppDeployment
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/decline-deployment
    declineApplicationDeployment(applicationId: string, reason: string) { return this.restApplications.declineApplicationDeployment(applicationId, reason); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_deleteApp
    // DELETE /api/rainbow/applications/v1.0/applications/:applicationId
    deleteApplication(applicationId: string) { return this.restApplications.deleteApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_deployApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/deploy
    deployApplication(applicationId: string) { return this.restApplications.deployApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppsByUserId
    // GET /api/rainbow/applications/v1.0/users/:userId/applications
    getAllApplicationsCreatedByUser(userId: string = undefined) { return this.restApplications.getAllApplicationsCreatedByUser(userId || this.userId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppById
    // GET /api/rainbow/applications/v1.0/applications/:appId
    getApplicationDataById(appId: string) { return this.restApplications.getApplicationDataById(appId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_getEmbedFrame
    // GET /api/rainbow/applications/v1.0/applications/:applicationId/embed-frame
    getEmbedFrameForApplication(applicationId: string) { return this.restApplications.getEmbedFrameForApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_getEmbeddingFrame
    // GET /api/rainbow/applications/v1.0/applications/:applicationId/embedding-frame
    getEmbeddingFrameForApplication(applicationId: string) { return this.restApplications.getEmbeddingFrameForApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_renewExpiredApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/renew
    renewExpiredApplication(applicationId: string) { return this.restApplications.renewExpiredApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_requestAppDeployment
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/request-deployment
    requestDeploymentOfApplication(applicationId: string) { return this.restApplications.requestDeploymentOfApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_restartApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/restart
    restartApplication(applicationId: string) { return this.restApplications.restartApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_stopApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/stop
    stopApplication(applicationId: string) { return this.restApplications.stopApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_unblockApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/unblock
    unblockApplication(applicationId: string) { return this.restApplications.unblockApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_updateApp
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId
    updateApplication(applicationId: string, applicationData: object) { return this.restApplications.updateApplication(applicationId, applicationData); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_getAppCounters
    // GET /api/rainbow/applications/v1.0/applications/:applicationId/counters
    getCountersForApplication(applicationId: string) { return this.restApplications.getCountersForApplication(applicationId); }
    // API https://api.openrainbow.org/application/#api-applications-applications_applications_updateAppCounter
    // PUT /api/rainbow/applications/v1.0/applications/:applicationId/counters
    updateCounterForApplication(applicationId: string, counterData: object) { return this.restApplications.updateCounterForApplication(applicationId, counterData); }
    //endregion Applications

    //region Favorites
    // GET /api/rainbow/enduser/v1.0/users/:userId/favorites
    getServerFavorites(peerId: string = undefined) { return this.restSubscriptions.getServerFavorites(this.userId, peerId); }
    addServerFavorite(peerId: string, type: string, position: number) { return this.restSubscriptions.addServerFavorite(this.userId, peerId, type, position); }
    checkIsPeerSettedAsFavorite(peerId: string) { return this.restSubscriptions.checkIsPeerSettedAsFavorite(this.userId, peerId); }
    getFavoriteById(favoriteId: string) { return this.restSubscriptions.getFavoriteById(this.userId, favoriteId); }
    getAllUserFavoriteList(peerId: string) { return this.restSubscriptions.getAllUserFavoriteList(this.userId, peerId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    moveFavoriteToPosition(favoriteId: string, position: number) { return this.restSubscriptions.moveFavoriteToPosition(this.userId, favoriteId, position); }
    removeServerFavorite(favoriteId: string) { return this.restSubscriptions.removeServerFavorite(this.userId, favoriteId); }
    //endregion Favorites

    //region Invitations
    // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
    // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
    getAllSentInvitations() { return this.restInvitations.getAllSentInvitations(this.account?.id); }
    // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
    // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
    getInvitationsSent(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = undefined, sortOrder: number = 1) { return this.restInvitations.getInvitationsSent(this.account?.id, sortField, status, format, limit, offset, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
    // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
    getAllReceivedInvitations() { return this.restInvitations.getAllReceivedInvitations(this.account?.id); }
    // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
    // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
    getInvitationsReceived(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = 0, sortOrder: number = 1) { return this.restInvitations.getInvitationsReceived(this.account?.id, sortField, status, format, limit, offset, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-invitations-getUserInvitation
    // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
    getServerInvitation(invitationId) { return this.restInvitations.getServerInvitation(this.account?.id, invitationId); }
    // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
    sendInvitationByCriteria(email: string, lang: string, customMessage: string, invitedPhoneNumber: string, invitedUserId: string) { return this.restInvitations.sendInvitationByCriteria(this.account?.id, email, lang, customMessage, invitedPhoneNumber, invitedUserId); }
    // API https://api.openrainbow.org/enduser/#api-invitations-cancelUserInvitation
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/cancel
    cancelOneSendInvitation(invitation) { return this.restInvitations.cancelOneSendInvitation(this.account?.id, invitation); }
    // API https://api.openrainbow.org/enduser/#api-invitations-deleteUserInvitation
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
    deleteAUserInvitation(invitation) { return this.restInvitations.deleteAUserInvitation(this.account?.id, invitation); }
    // API https://api.openrainbow.org/enduser/#api-invitations-resendUserInvitation
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/re-send
    reSendInvitation(invitationId: string, customMessage: string) { return this.restInvitations.reSendInvitation(this.account?.id, invitationId, customMessage); }
    // API https://api.openrainbow.org/enduser/#api-invitations-createUserBulkInvitations
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/bulk
    sendInvitationsByBulk(listOfMails, lang: string = undefined, customMessage: string = undefined) { return this.restInvitations.sendInvitationsByBulk(this.userId, listOfMails, lang, customMessage); }
    // API https://api.openrainbow.org/enduser/#api-invitations-acceptUserInvitation
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/accept
    acceptInvitation(invitation) { return this.restInvitations.acceptInvitation(invitation); }
    // POST /api/rainbow/enduser/v1.0/users/
    declineInvitation(invitation) { return this.restInvitations.declineInvitation(invitation); }
    // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
    // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
    joinContactInvitation(contact) { return this.restInvitations.joinContactInvitation(this.account?.id, contact); }
    // POST /api/rainbow/admin/v1.0/users/
    joinContacts(contact, contactIds, presence) { return this.restInvitations.joinContacts(contact, contactIds, presence); }
    // GET /api/rainbow/enduser/v1.0/users/
    getInvitationById(invitationId) { return this.restInvitations.getInvitationById(this.account?.id, invitationId); }
    //endregion Invitations

    //region Groups
    // GET /api/rainbow/enduser/v1.0/users/
    getGroups() { return this.restGroups.getGroups(this.account?.id); }
    // GET /api/rainbow/enduser/v1.0/users/
    getGroup(groupId: string) { return this.restGroups.getGroup(this.account?.id, groupId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    updateGroupFavorite(groupId: string, favorite: boolean) { return this.restGroups.updateGroupFavorite(this.account?.id, groupId, favorite); }
    // POST /api/rainbow/enduser/v1.0/users/
    createGroup(name: string, comment: string, isFavorite: boolean) { return this.restGroups.createGroup(this.account?.id, name, comment, isFavorite); }
    // DELETE /api/rainbow/enduser/v1.0/users/
    deleteGroup(groupId: string) { return this.restGroups.deleteGroup(this.account?.id, groupId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    updateGroupName(groupId: string, name: string) { return this.restGroups.updateGroupName(this.account?.id, groupId, name); }
    // PUT /api/rainbow/enduser/v1.0/users/
    updateGroupComment(groupId: string, comment: string) { return this.restGroups.updateGroupComment(this.account?.id, groupId, comment); }
    // POST /api/rainbow/enduser/v1.0/users/
    addUserInGroup(contactId: string, groupId: string) { return this.restGroups.addUserInGroup(this.account?.id, contactId, groupId); }
    // DELETE /api/rainbow/enduser/v1.0/users/
    removeUserFromGroup(contactId: string, groupId: string) { return this.restGroups.removeUserFromGroup(this.account?.id, contactId, groupId); }
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
    // GET /api/rainbow/admin/v1.0/users/
    getUserPresenceInformation(userId: string = undefined) { return this.restPresence.getUserPresenceInformation(userId || this.userId); }
    // GET /api/rainbow/enduser/v1.0/users/me/presences
    getMyPresenceInformation() { return this.restPresence.getMyPresenceInformation(); }
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

    /**
     * @method presenceShow
     * @public
     * @description
     *      Appelle l'API UCS Presence.show pour définir le champ `show` (et éventuellement `status`) de la présence
     *      du compte associé à la connexion S2S courante.
     *      Cette méthode s'appuie sur l'endpoint REST Rainbow:
     *      PUT /api/rainbow/ucs/v1.0/connections/{connectionId}/presences
     *      Documentation: https://api.openrainbow.org/doc/rest/api/ucs/redoc-index.html#tag/Presence/operation/Presence.show
     *
     *      Prérequis: une connexion S2S doit être active (voir loginS2S) pour disposer d'un `connectionId`.
     *
     * @param {string} show Valeur de présence à appliquer (ex: "online", "away", "xa", "dnd", "invisible").
     * @param {string} [status] Message de statut libre (optionnel).
     * @param {string} [connectionId] Identifiant de connexion S2S. Si non fourni, celui de `this.connectionS2SInfo.id` est utilisé.
     * @returns {Promise<any>} La réponse REST (payload `data`).
     *
     * @example
     * // Définit la présence en Ne pas déranger avec un message personnalisé
     * await restService.presenceShow("dnd", "En réunion");
     */
    async presenceShow(show: string, status: string = "", connectionId?: string): Promise<any> {
        let that = this;
        const cnxId = connectionId || that.connectionS2SInfo?.id;
        that._logger.log(that.INFO, LOG_ID + "(presenceShow) will set UCS presence show.");
        that._logger.log(that.INTERNAL, LOG_ID + "(presenceShow) params : ", { show, status, cnxIdProvided: !!connectionId });

        if (!cnxId) {
            that._logger.log(that.ERROR, LOG_ID, "(presenceShow) error: no S2S connection id available");
            that._logger.log(that.INTERNALERROR, LOG_ID, "(presenceShow) error connectionS2SInfo.id is not defined");
            return Promise.reject(new Error("presenceShow: connectionS2SInfo.id manquant. Appelez loginS2S d'abord."));
        }

        const body = { presence: { show: show || "", status: status || "" } };

        return new Promise((resolve, reject) => {
            that.http.put(`/api/rainbow/ucs/v1.0/connections/${cnxId}/presences`, that.getRequestHeader(), body, undefined)
                .then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(presenceShow) successfull.");
                    that._logger.log(that.INTERNAL, LOG_ID + "(presenceShow) REST result : ", json);
                    resolve(json?.data);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(presenceShow) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(presenceShow) error : ", err);
                    return reject(err);
                });
        });
    }

    /**
     * @method presenceProbeGet
     * @public
     * @description
     *      Récupère/sonde la présence d’un utilisateur via l’API UCS (méthode GET).
     *      Cette méthode s'appuie sur l'endpoint REST Rainbow:
     *      GET /api/rainbow/ucs/v1.0/connections/{connectionId}/presences/{userId}
     *
     *      Prérequis: une connexion S2S doit être active (voir loginS2S) pour disposer d'un `connectionId`.
     *
     * @param {string} userId Identifiant Rainbow de l'utilisateur ciblé (UUID Rainbow, pas un JID).
     * @param {string} [connectionId] Identifiant de connexion S2S. Si non fourni, celui de `this.connectionS2SInfo.id` est utilisé.
     * @returns {Promise<any>} La réponse REST (payload `data`).
     *
     * @example
     * // Récupère/sonde la présence d’un utilisateur par son userId Rainbow
     * await restService.presenceProbeGet("cce80c33c78c47c0907a6bfa3f4ffe72");
     */
    async presenceProbeGet(userId: string, connectionId?: string): Promise<any> {
        const that = this;
        const cnxId = connectionId || that.connectionS2SInfo?.id;
        that._logger.log(that.INFO, LOG_ID + "(presenceProbeGet) will GET UCS presence for a user.");
        that._logger.log(that.INTERNAL, LOG_ID + "(presenceProbeGet) params : ", { userId, cnxIdProvided: !!connectionId });

        if (!cnxId) {
            that._logger.log(that.ERROR, LOG_ID, "(presenceProbeGet) error: no S2S connection id available");
            that._logger.log(that.INTERNALERROR, LOG_ID, "(presenceProbeGet) error connectionS2SInfo.id is not defined");
            return Promise.reject(new Error("presenceProbeGet: connectionS2SInfo.id manquant. Appelez loginS2S d'abord."));
        }

        if (!userId || typeof userId !== "string") {
            that._logger.log(that.WARN, LOG_ID + "(presenceProbeGet) bad or empty 'userId' parameter");
            return Promise.reject(new Error("presenceProbeGet: paramètre 'userId' invalide"));
        }

        return new Promise((resolve, reject) => {
            that.http.get(`/api/rainbow/ucs/v1.0/connections/${cnxId}/presences/${userId}`, that.getRequestHeader(), undefined)
                .then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(presenceProbeGet) successfull.");
                    that._logger.log(that.INTERNAL, LOG_ID + "(presenceProbeGet) REST result : ", json);
                    resolve(json?.data);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(presenceProbeGet) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(presenceProbeGet) error : ", err);
                    return reject(err);
                });
        });
    }

    //region Bubbles

    // POST /api/rainbow/enduser/v1.0/rooms
    createBubble(name, description, history="all", p_number=0, visibility="private", disableNotifications=false, autoRegister='unlock', autoAcceptInvitation=false, muteUponEntry=false, playEntryTone=true) { return this.restBubbles.createBubble(name, description, history, p_number, visibility, disableNotifications, autoRegister, autoAcceptInvitation, muteUponEntry, playEntryTone); }
    // API https://api.openrainbow.org/enduser/#api-rooms-updateRoom
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId
    updateRoomData(bubbleId, data) { return this.restBubbles.updateRoomData(bubbleId, data); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleVisibility(bubbleId, visibility) { return this.restBubbles.setBubbleVisibility(bubbleId, visibility); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleAutoRegister(bubbleId, autoRegister="unlock") { return this.restBubbles.setBubbleAutoRegister(bubbleId, autoRegister); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleTopic(bubbleId, topic) { return this.restBubbles.setBubbleTopic(bubbleId, topic); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleName(bubbleId, name) { return this.restBubbles.setBubbleName(bubbleId, name); }
    getBubbleLastActivityDate(bubble) { return this.restBubbles.getBubbleLastActivityDate(bubble); }
    sortByDate(dateA, dateB) { return this.restBubbles.sortByDate(dateA, dateB); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRooms
    // GET /api/rainbow/enduser/v1.0/rooms
    getBubbles(format="small", unsubscribed=false) { return this.restBubbles.getBubbles(this.account?.id, format, unsubscribed); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRoomById
    // GET /api/rainbow/enduser/v1.0/rooms/:roomId
    getBubble(bubbleId, context=undefined, format="full", unsubscribed=true, nbUsersToKeep=100) { return this.restBubbles.getBubble(bubbleId, context, format, unsubscribed, nbUsersToKeep); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRoomByJid
    // GET /api/rainbow/enduser/v1.0/rooms/jids/:jid
    getBubbleByJid(bubbleJid, format="full", unsubscribed=true, nbUsersToKeep=100) { return this.restBubbles.getBubbleByJid(bubbleJid, format, unsubscribed, nbUsersToKeep); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRoomJIDs
    // GET /api/rainbow/enduser/v1.0/rooms/jids
    getAllBubblesJidsOfAUserIsMemberOf(isActive?, webinar?, unsubscribed=true, limit=100, offset=0, sortField?, sortOrder=1) { return this.restBubbles.getAllBubblesJidsOfAUserIsMemberOf(isActive, webinar, unsubscribed, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRooms
    // GET /api/rainbow/enduser/v1.0/rooms
    getAllBubblesVisibleByTheUser(format="small", userId?, status?, confId?, scheduled?, hasConf?, isActive?, name?, sortField?, sortOrder=1, unsubscribed=false, webinar?, limit=100, offset=0, nbUsersToKeep=100, creator?, context?, needIsAlertNotificationEnabled="true") { return this.restBubbles.getAllBubblesVisibleByTheUser(format, userId, status, confId, scheduled, hasConf, isActive, name, sortField, sortOrder, unsubscribed, webinar, limit, offset, nbUsersToKeep, creator, context, needIsAlertNotificationEnabled, this.account?.id); }
    // API https://api.openrainbow.org/enduser/#api-rooms-getRoomsByIds
    // GET /api/rainbow/enduser/v1.0/rooms/ids
    getBubblesDataByListOfBubblesIds(bubblesIds, format="small", userId?, status?, confId?, scheduled?, hasConf?, sortField?, sortOrder=1, unsubscribed=false, webinar?, limit=100, offset=0, nbUsersToKeep=100, context?, needIsAlertNotificationEnabled="true") { return this.restBubbles.getBubblesDataByListOfBubblesIds(bubblesIds, format, userId, status, confId, scheduled, hasConf, sortField, sortOrder, unsubscribed, webinar, limit, offset, nbUsersToKeep, context, needIsAlertNotificationEnabled); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleCustomData(bubbleId, customData) { return this.restBubbles.setBubbleCustomData(bubbleId, customData); }
    // POST /api/rainbow/enduser/v1.0/rooms/
    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) { return this.restBubbles.inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason); }
    // API https://api.openrainbow.org/enduser/#api-rooms_invitation-sendUsersJoinRoomInvitation
    // POST /api/rainbow/enduser/v1.0/rooms/:roomId/invitations
    inviteContactsByEmailsToBubble(contactsEmails, bubbleId) { return this.restBubbles.inviteContactsByEmailsToBubble(contactsEmails, bubbleId); }
    // GET /api/rainbow/enduser/v1.0/rooms/
    getRoomUsers(bubbleId, options={}) { return this.restBubbles.getRoomUsers(bubbleId, options); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    promoteContactInBubble(contactId, bubbleId, asModerator) { return this.restBubbles.promoteContactInBubble(contactId, bubbleId, asModerator); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    changeBubbleOwner(bubbleId, contactId) { return this.restBubbles.changeBubbleOwner(bubbleId, contactId); }
    // API https://api.openrainbow.org/enduser/#api-rooms-updateRoomArchive
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/archive
    archiveBubble(bubbleId) { return this.restBubbles.archiveBubble(bubbleId); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/
    leaveBubble(bubbleId, bubbleStatus) { return this.restBubbles.leaveBubble(bubbleId, bubbleStatus, this.account?.id); }
    // API https://api.openrainbow.org/enduser/#api-rooms-deleteRoom
    // DELETE /api/rainbow/enduser/v1.0/rooms/:roomId
    deleteBubble(bubbleId) { return this.restBubbles.deleteBubble(bubbleId); }
    // API https://api.openrainbow.org/enduser/#api-rooms_password_management-activateRoomAccessByPassword
    // POST /api/rainbow/enduser/v1.0/rooms/:roomId/passwords
    setRoomHasPassword(roomId, hasPassword=false) { return this.restBubbles.setRoomHasPassword(roomId, hasPassword); }
    // API https://api.openrainbow.org/enduser/#api-rooms_password_management-renewPassword
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/passwords/reset
    renewRoomPassword(roomId) { return this.restBubbles.renewRoomPassword(roomId); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setBubbleLobby(bubbleId, hasLobby) { return this.restBubbles.setBubbleLobby(bubbleId, hasLobby); }
    // GET /api/rainbow/enduser/v1.0/rooms/
    getBubbleLobby(bubbleId) { return this.restBubbles.getBubbleLobby(bubbleId); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    acceptBubbleLobby(bubbleId, scope, users=undefined) { return this.restBubbles.acceptBubbleLobby(bubbleId, scope, users); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    denyBubbleLobby(bubbleId, scope, users=undefined) { return this.restBubbles.denyBubbleLobby(bubbleId, scope, users); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/
    removeInvitationOfContactToBubble(contactId, bubbleId) { return this.restBubbles.removeInvitationOfContactToBubble(contactId, bubbleId); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    unsubscribeContactFromBubble(contactId, bubbleId) { return this.restBubbles.unsubscribeContactFromBubble(contactId, bubbleId); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    acceptInvitationToJoinBubble(bubbleId) { return this.restBubbles.acceptInvitationToJoinBubble(bubbleId, this.account?.id); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    declineInvitationToJoinBubble(bubbleId) { return this.restBubbles.declineInvitationToJoinBubble(bubbleId, this.account?.id); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/
    deleteUserFromBubble(bubbleId) { return this.restBubbles.deleteUserFromBubble(bubbleId, this.account?.id); }
    // POST /api/rainbow/admin/v1.0/companies/
    inviteUser(email, _companyId, language, message) { return this.restBubbles.inviteUser(email, _companyId, language, message, this.account?.companyId); }
    // POST /api/rainbow/enduser/v1.0/rooms/
    setAvatarRoom(bubbleid, binaryData) { return this.restBubbles.setAvatarRoom(bubbleid, binaryData); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/
    deleteAvatarRoom(roomId) { return this.restBubbles.deleteAvatarRoom(roomId); }
    // GET /api/rainbow/enduser/v1.0/rooms/consumption
    getBubblesConsumption() { return this.restBubbles.getBubblesConsumption(); }
    // GET /api/rainbow/enduser/v1.0/rooms/containers/
    getAllBubblesContainers(name=null) { return this.restBubbles.getAllBubblesContainers(name); }
    // GET /api/rainbow/enduser/v1.0/rooms/containers/
    getABubblesContainersById(id=null) { return this.restBubbles.getABubblesContainersById(id); }
    // PUT /api/rainbow/enduser/v1.0/rooms/containers/
    addBubblesToContainerById(containerId, bubbleIds) { return this.restBubbles.addBubblesToContainerById(containerId, bubbleIds); }
    // PUT /api/rainbow/enduser/v1.0/rooms/containers/
    updateBubbleContainerNameAndDescriptionById(containerId, name, description?) { return this.restBubbles.updateBubbleContainerNameAndDescriptionById(containerId, name, description); }
    // POST /api/rainbow/enduser/v1.0/rooms/containers/
    createBubbleContainer(name, description?, bubbleIds?) { return this.restBubbles.createBubbleContainer(name, description, bubbleIds); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/containers/
    deleteBubbleContainer(containerId) { return this.restBubbles.deleteBubbleContainer(containerId); }
    // PUT /api/rainbow/enduser/v1.0/rooms/containers/
    removeBubblesFromContainer(containerId, bubbleIds) { return this.restBubbles.removeBubblesFromContainer(containerId, bubbleIds); }

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
    // POST /api/rainbow/filestorage/v1.0/files
    createFileDescriptor(name, extension, size, viewers, voicemessage: boolean, duration: number, encoding: boolean, ccarelogs: boolean, ccareclientlogs: boolean) { return this.restFileStorage.createFileDescriptor(name, extension, size, viewers, voicemessage, duration, encoding, ccarelogs, ccareclientlogs); }
    // DELETE /api/rainbow/filestorage/v1.0/files/
    deleteFileDescriptor(fileId) { return this.restFileStorage.deleteFileDescriptor(fileId); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_getAll
    // GET /api/rainbow/filestorage/v1.0/files
    retrieveFileDescriptors(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number = 1000, offset: number, sortField: string, sortOrder: number, format: string = "full") { return this.restFileStorage.retrieveFileDescriptors(fileName, extension, typeMIME, purpose, isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-getAllConferenceRecords
    // GET /api/rainbow/filestorage/v1.0/conferences-recordings
    getAllConferenceRecords(roomName?: string, recordingName?: string, status?: string, roomId?: string, purpose?: string, fetch: string = "mine", isEphemeral?: boolean, limit: number = 100, offset: number = 0, sortField: string = "recordingStartDate", sortOrder: number = 1, format: string = "small") { return this.restFileStorage.getAllConferenceRecords(roomName, recordingName, status, roomId, purpose, fetch, isEphemeral, limit, offset, sortField, sortOrder, format); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-updateOneConferenceRecord
    // PUT /api/rainbow/filestorage/v1.0/conferences-recordings/:confrecid
    updateOneConferenceRecordName(confrecid: string, recordingName: string) { return this.restFileStorage.updateOneConferenceRecordName(confrecid, recordingName); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-getOneConferenceRecord
    // GET /api/rainbow/filestorage/v1.0/conferences-recordings/:confrecid
    getOneConferenceRecord(confrecid: string) { return this.restFileStorage.getOneConferenceRecord(confrecid); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-DeleteOneConferenceRecord
    // DELETE /api/rainbow/filestorage/v1.0/files/viewers/
    deleteOneConferenceRecord(confrecid: string) { return this.restFileStorage.deleteOneConferenceRecord(confrecid); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-DeleteOneDocumentConferenceRecord
    // DELETE /api/rainbow/filestorage/v1.0/files/viewers/
    deleteOneDocumentConferenceRecord(confrecid: string, fileId: string) { return this.restFileStorage.deleteOneDocumentConferenceRecord(confrecid, fileId); }
    // API https://api.openrainbow.org/filestorage/#api-conference_records-getOneConferenceRecordExternalRef
    // POST /api/rainbow/filestorage/v1.0/files/viewers/
    getOneConferenceRecordExternalRef(registrationUuid: string) { return this.restFileStorage.getOneConferenceRecordExternalRef(registrationUuid); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_getAllViewerId
    // GET /api/rainbow/filestorage/v1.0/files/viewers/
    retrieveFilesReceivedFromPeer(userId, peerId) { return this.restFileStorage.retrieveFilesReceivedFromPeer(userId, peerId); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_getAllViewerId
    // GET /api/rainbow/filestorage/v1.0/files/viewers/
    retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string = "full", limit: number = 100, offset: number, sortField: string, sortOrder: number) { return this.restFileStorage.retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId, fileName, extension, typeMIME, isUploaded, purpose, roomName, overall, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_getOne
    // GET /api/rainbow/filestorage/v1.0/files/
    retrieveOneFileDescriptor(fileId) { return this.restFileStorage.retrieveOneFileDescriptor(fileId); }
    // GET /api/rainbow/filestorage/v1.0/users/consumption
    retrieveUserConsumption() { return this.restFileStorage.retrieveUserConsumption(); }
    // DELETE /api/rainbow/filestorage/v1.0/files/
    deleteFileViewer(viewerId, fileId) { return this.restFileStorage.deleteFileViewer(viewerId, fileId); }
    // POST /api/rainbow/filestorage/v1.0/files/
    addFileViewer(fileId, viewerId, viewerType) { return this.restFileStorage.addFileViewer(fileId, viewerId, viewerType); }
    // GET /api/rainbow/filestorage/v1.0/files/
    getFileDescriptorsByCompanyId(companyId, fileName: boolean, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "fileName", sortOrder: number = 1) { return this.restFileStorage.getFileDescriptorsByCompanyId(companyId, fileName, extension, typeMIME, purpose, isUploaded, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_copyOne
    // POST /api/rainbow/filestorage/v1.0/files/
    copyFileInPersonalCloudSpace(fileId: string) { return this.restFileStorage.copyFileInPersonalCloudSpace(fileId); }
    // API https://api.openrainbow.org/filestorage/#api-files-files_dropOne
    // PUT /api/rainbow/filestorage/v1.0/files/
    fileOwnershipChange(fileId: string, userId: string) { return this.restFileStorage.fileOwnershipChange(fileId, userId); }
    //endregion FileStorage

    //region FileServer
    // GET /api/rainbow/fileserver/v1.0/files/
    getPartialDataFromServer(url, minRange, maxRange, index) { return this.restFileStorage.getPartialDataFromServer(url, minRange, maxRange, index); }
    // GET /api/rainbow/fileserver/v1.0/files/
    getPartialBufferFromServer(url, minRange, maxRange, index) { return this.restFileStorage.getPartialBufferFromServer(url, minRange, maxRange, index); }
    // GET /api/rainbow/fileserver/v1.0/files/
    getFileFromUrl(url) { return this.restFileStorage.getFileFromUrl(url); }
    // GET /api/rainbow/fileserver/v1.0/files/
    getBlobFromUrl(url) { return this.restFileStorage.getBlobFromUrl(url); }
    // PUT /api/rainbow/fileserver/v1.0/files/:fileId
    uploadAFile(fileId, buffer) { return this.restFileStorage.uploadAFile(fileId, buffer); }
    // PUT /api/rainbow/fileserver/v1.0/files/:fileId
    uploadABuffer(fileId, buffer) { return this.restFileStorage.uploadABuffer(fileId, buffer); }
    // GET /api/rainbow/fileserver/v1.0/files/
    uploadAStream(fileId, stream) { return this.restFileStorage.uploadAStream(fileId, stream); }
    // GET /api/rainbow/fileserver/v1.0/files/
    sendPartialDataToServer(fileId, file, index) { return this.restFileStorage.sendPartialDataToServer(fileId, file, index); }
    // GET /api/rainbow/fileserver/v1.0/files/
    sendPartialFileCompletion(fileId) { return this.restFileStorage.sendPartialFileCompletion(fileId); }
    // GET /api/rainbow/fileserver/v1.0/files/:fileId/temporary-url
    getFilesTemporaryURL(fileId: string) { return this.restFileStorage.getFilesTemporaryURL(fileId); }
    //endregion FileServer

    //region Settings

    // GET /api/rainbow/enduser/v1.0/users/
    getUserSettings() { return this.restSettings.getUserSettings(this.account?.id); }
    // PUT /api/rainbow/enduser/v1.0/users/
    updateUserSettings(settings) { return this.restSettings.updateUserSettings(this.account?.id, settings); }

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
    // API https://api.openrainbow.org/admin/#api-companies-GetCompanies
    // URL get /api/rainbow/admin/v1.0/companies
    getAllCompanies(format?, sortField?, bpId?, catalogId?, offerId?, offerCanBeSold?, externalReference?, externalReference2?, salesforceAccountId?, selectedAppCustomisationTemplate?, selectedThemeObj?, offerGroupName?, limit?, offset?, sortOrder?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType, this.account.roles); }
    // API https://api.openrainbow.org/admin/#api-companies-PostCompanies
    // URL post /api/rainbow/admin/v1.0/companies
    createCompany(name, country, state, offerType) { return this.restCompany.createCompany(name, country, state, offerType); }
    // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesId
    // URL get /api/rainbow/admin/v1.0/companies/:companyId
    getCompany(companyId) { return this.restCompany.getCompany(companyId); }
    // API https://api.openrainbow.org/admin/#api-companies-DeleteCompanies
    // URL delete /api/rainbow/admin/v1.0/companies/:companyId
    deleteCompany(companyId) { return this.restCompany.deleteCompany(companyId); }
    // API https://api.openrainbow.org/enduser/#api-companies-getCompanyById
    // URL get /api/rainbow/enduser/v1.0/companies/:companyId
    getCompanyInfos(companyId, format?, selectedThemeObj?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getCompanyInfos(companyId, format, selectedThemeObj, name, status, visibility, organisationId, isBP, hasBP, bpType); }
    // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesBpBusinessType
    // URL get /api/rainbow/admin/v1.0/companies/bpbusinesstypes
    getCompaniesBPBusinessType() { return this.restCompany.getCompaniesBPBusinessType(); }
    // API https://api.openrainbow.org/admin/#api-companies-GetCompanyAppFeatureCustomisation
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation
    getCompanyAppFeatureCustomisation(_companyId) { return this.restCompany.getCompanyAppFeatureCustomisation(_companyId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesServiceDescription
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/service-description
    getCompanyServiceDescriptionFile(_companyId) { return this.restCompany.getCompanyServiceDescriptionFile(_companyId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies-GetDefaultCompany
    // URL get /api/rainbow/admin/v1.0/companies/default
    getDefaultCompanyData(format?, selectedThemeObj?) { return this.restCompany.getDefaultCompanyData(format, selectedThemeObj); }
    // API https://api.openrainbow.org/admin/#api-companies-SetCompanyFeatureCustomisation
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation
    setCompanyAppFeatureCustomisation(_companyId, appFeaturesCustomisation) { return this.restCompany.setCompanyAppFeatureCustomisation(_companyId, appFeaturesCustomisation, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies-PutCompanies
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId
    updateCompany(_companyId, selectedThemeObj, name, country, street, city, state, postalCode, offerType, currency, status, visibility, visibleBy, adminEmail, supportEmail, supportUrlFAQ, companyContactId, disableCCareAdminAccess, disableCCareAdminAccessCustomers, disableCCareAdminAccessResellers, autoAcceptUserInvitations, autoAddToUserNetwork, contentPolicyLifeTime, documentGracePeriod, userSelfRegisterAllowedDomains, slogan, description, size, economicActivityClassification, website, giphyEnabled, catalogId, adminCanSetCustomData, customData, bpId, adminHasRightToUpdateSubscriptions, adminAllowedUpdateSubscriptionsOps, isBP, bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpHasRightForBYOT, preferredSipLoadBalancerId, bpIsContractAccepted, externalReference, externalReference2, salesforceAccountId, avatarShape, isCentrex, companyCallNumber, superadminComment, bpBusinessType, billingModel, allowUsersSelectTheme, allowUsersSelectPublicTheme, selectedTheme, mobilePermanentConnectionMode, alertNotificationReception, alertNotificationSending, useDialOutCustomisation, allowDeviceFirmwareSelection, selectedDeviceFirmware, cloudPbxVoicemailToEmail, businessData, defaultLicenseGroup, defaultOptionsGroups, selectedThemeCustomers, allowTeamsToDesktopSso, cloudPbxRecordingInboundOnly, supervisionGroupMaxSize, supervisionGroupMaxNumber, supervisionGroupMaxUsers, timezone, sendPrepaidSubscriptionsNotification, ddiReadOnly, allowPhoneNumbersVisibility, csEmailList, seEmailList, csmEmailList, kamEmailList, businessSpecific, adminServiceNotificationsLevel) { return this.restCompany.updateCompany(_companyId, selectedThemeObj, name, country, street, city, state, postalCode, offerType, currency, status, visibility, visibleBy, adminEmail, supportEmail, supportUrlFAQ, companyContactId, disableCCareAdminAccess, disableCCareAdminAccessCustomers, disableCCareAdminAccessResellers, autoAcceptUserInvitations, autoAddToUserNetwork, contentPolicyLifeTime, documentGracePeriod, userSelfRegisterAllowedDomains, slogan, description, size, economicActivityClassification, website, giphyEnabled, catalogId, adminCanSetCustomData, customData, bpId, adminHasRightToUpdateSubscriptions, adminAllowedUpdateSubscriptionsOps, isBP, bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpHasRightForBYOT, preferredSipLoadBalancerId, bpIsContractAccepted, externalReference, externalReference2, salesforceAccountId, avatarShape, isCentrex, companyCallNumber, superadminComment, bpBusinessType, billingModel, allowUsersSelectTheme, allowUsersSelectPublicTheme, selectedTheme, mobilePermanentConnectionMode, alertNotificationReception, alertNotificationSending, useDialOutCustomisation, allowDeviceFirmwareSelection, selectedDeviceFirmware, cloudPbxVoicemailToEmail, businessData, defaultLicenseGroup, defaultOptionsGroups, selectedThemeCustomers, allowTeamsToDesktopSso, cloudPbxRecordingInboundOnly, supervisionGroupMaxSize, supervisionGroupMaxNumber, supervisionGroupMaxUsers, timezone, sendPrepaidSubscriptionsNotification, ddiReadOnly, allowPhoneNumbersVisibility, csEmailList, seEmailList, csmEmailList, kamEmailList, businessSpecific, adminServiceNotificationsLevel, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies-PutCompanies
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId
    updateCompanyByObj(_companyId, selectedThemeObj, companyInfoToUpdate) { return this.restCompany.updateCompanyByObj(_companyId, selectedThemeObj, companyInfoToUpdate, this.account.companyId); }
    //endregion Company Management

    //region Companies RainbowMFA Settings
    // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PostCompanyRainbowMFASettings
    // URL POST /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
    createRainbowMultifactorAuthenticationServerConfiguration(_companyId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled) { return this.restCompany.createRainbowMultifactorAuthenticationServerConfiguration(_companyId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-DeleteCompanyRainbowMFASettings
    // URL delete /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
    deleteRainbowMultifactorConfiguration(_companyId, mfaId) { return this.restCompany.deleteRainbowMultifactorConfiguration(_companyId, mfaId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetCompanyRainbowMFASettings
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
    getRainbowMultifactorConfiguration(_companyId, mfaId) { return this.restCompany.getRainbowMultifactorConfiguration(_companyId, mfaId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetAllCompanyRainbowMFASettings
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
    getAllRainbowMultifactorConfiguration(_companyId, format?) { return this.restCompany.getAllRainbowMultifactorConfiguration(_companyId, format, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PutCompanyRainbowMFASettings
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
    updateRainbowMultifactorAuthenticationConfiguration(_companyId, mfaId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled) { return this.restCompany.updateRainbowMultifactorAuthenticationConfiguration(_companyId, mfaId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled, this.account.companyId); }
    //endregion Companies RainbowMFA Settings

    //region Company join companies links
    // API https://api.openrainbow.org/admin/#api-join_companies_links-PostJoinCompaniesLinks
    // URL POST /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
    createAJoinCompanyLink(_companyId, description?, isEnabled?, expirationDate?, maxNumberUsers?) { return this.restCompany.createAJoinCompanyLink(_companyId, description, isEnabled, expirationDate, maxNumberUsers, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-join_companies_links-DeleteJoinCompaniesLinksById
    // URL delete /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
    deleteAJoinCompanyLink(_companyId, joinCompanyLinkId) { return this.restCompany.deleteAJoinCompanyLink(_companyId, joinCompanyLinkId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinksById
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
    getAJoinCompanyLink(companyId, joinCompanyLinkId) { return this.restCompany.getAJoinCompanyLink(companyId, joinCompanyLinkId); }
    // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinks
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
    getAllJoinCompanyLinks(_companyId, format?, createdByAdminId?, isEnabled?, fromExpirationDate?, toExpirationDate?, fromNbUsersRegistered?, toNbUsersRegistered?, limit?, offset?, sortField?, sortOrder?) { return this.restCompany.getAllJoinCompanyLinks(_companyId, format, createdByAdminId, isEnabled, fromExpirationDate, toExpirationDate, fromNbUsersRegistered, toNbUsersRegistered, limit, offset, sortField, sortOrder, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-join_companies_links-PutJoinCompaniesLinks
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
    updateAJoinCompanyLink(_companyId, joinCompanyLinkId, description, isEnabled?, expirationDate?, maxNumberUsers?) { return this.restCompany.updateAJoinCompanyLink(_companyId, joinCompanyLinkId, description, isEnabled, expirationDate, maxNumberUsers, this.account.companyId); }
    //endregion Company join companies links

    //region Company from end user portal
    // API https://api.openrainbow.org/enduser/#api-companies-createCompany
    // URL post /api/rainbow/enduser/v1.0/companies
    createCompanyFromDefault(name, visibility?, country?, state?, slogan?, description?, size?, economicActivityClassification?, website?, avatarShape?, giphyEnabled?) { return this.restCompany.createCompanyFromDefault(name, visibility, country, state, slogan, description, size, economicActivityClassification, website, avatarShape, giphyEnabled); }
    // API https://api.openrainbow.org/enduser/#api-companies-getCompanies
    // URL get /api/rainbow/enduser/v1.0/companies
    getAllCompaniesVisibleByUser(format?, sortField?, limit?, offset?, sortOrder?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getAllCompaniesVisibleByUser(format, sortField, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType); }
    // API https://api.openrainbow.org/enduser/#api-companies-getCompanyAdministrators
    // URL get /api/rainbow/enduser/v1.0/companies/:companyId/administrators
    getCompanyAdministrators(companyId, format?, limit?, offset?) { return this.restCompany.getCompanyAdministrators(companyId, format, limit, offset); }
    //endregion Company from end user portal

    //region Company visibility
    // API https://api.openrainbow.org/admin/#api-companies_visibility-PostCompaniesVisibility
    // URL post /api/rainbow/admin/v1.0/companies/:companyId/visible-by/:otherCompanyId
    setVisibilityForCompany(companyId, visibleByCompanyId) { return this.restCompany.setVisibilityForCompany(companyId, visibleByCompanyId); }
    //endregion Company visibility

    //region Company join company invitations
    // API https://api.openrainbow.org/enduser/#api-join_company_invitations-acceptJoinCompanyInvitation
    // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/accept
    acceptJoinCompanyInvitation(invitationId) { return this.restCompany.acceptJoinCompanyInvitation(invitationId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_invitations-declineJoinCompanyInvitation
    // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/decline
    declineJoinCompanyInvitation(invitationId) { return this.restCompany.declineJoinCompanyInvitation(invitationId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitationById
    // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId
    getJoinCompanyInvitation(invitationId) { return this.restCompany.getJoinCompanyInvitation(invitationId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitations
    // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations
    getAllJoinCompanyInvitations(sortField?, status?, format?, limit?, offset?, sortOrder?) { return this.restCompany.getAllJoinCompanyInvitations(sortField, status, format, limit, offset, sortOrder, this.userId); }
    //endregion Company join company invitations

    //region Company join company requests
    // API https://api.openrainbow.org/enduser/#api-join_company_requests-cancelJoinCompanyRequest
    // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/cancel
    cancelJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.cancelJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequestById
    // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId
    getJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.getJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequests
    // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
    getAllJoinCompanyRequests(sortField?, status?, format?, limit?, offset?, sortOrder?) { return this.restCompany.getAllJoinCompanyRequests(sortField, status, format, limit, offset, sortOrder, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_requests-resendJoinCompanyRequest
    // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/re-send
    resendJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.resendJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    // API https://api.openrainbow.org/enduser/#api-join_company_requests-sendJoinCompanyRequest
    // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
    requestToJoinCompany(requestedCompanyId?, requestedCompanyAdminId?, requestedCompanyLinkId?, lang?) { return this.restCompany.requestToJoinCompany(requestedCompanyId, requestedCompanyAdminId, requestedCompanyLinkId, lang, this.userId); }
    //endregion Company join company requests

    //region Companies Customization Emails
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmailsDocumentation
    // URL GET /api/rainbow/admin/v1.0/companies/customizations/emails
    getEmailTemplatesDocumentation(format) { return this.restCompany.getEmailTemplatesDocumentation(format); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-CreateCompanyCustomizationEmails
    // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
    initiateEmailTemplate(_companyId, templateName) { return this.restCompany.initiateEmailTemplate(_companyId, templateName, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsSubject
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/subject
    updateSubjectPartTemplate(_companyId, templateName, body) { return this.restCompany.updateSubjectPartTemplate(_companyId, templateName, body, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsMjml
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/mjml-format
    updateMjmlFormatPartTemplate(_companyId, templateName, body) { return this.restCompany.updateMjmlFormatPartTemplate(_companyId, templateName, body, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsText
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/text-format
    updateTextFormatFormatPartTemplate(_companyId, templateName, body) { return this.restCompany.updateTextFormatFormatPartTemplate(_companyId, templateName, body, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmails
    // URL get /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
    getEmailTemplatesByCompanyId(_companyId, templateName, format) { return this.restCompany.getEmailTemplatesByCompanyId(_companyId, templateName, format, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteOneCompanyCustomizationEmail
    // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName
    deleteEmailTemplate(_companyId, templateName) { return this.restCompany.deleteEmailTemplate(_companyId, templateName, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteCompanyCustomizationEmails
    // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/all
    deleteAvailableEmailTemplatesBycompanyId(_companyId, templateName) { return this.restCompany.deleteAvailableEmailTemplatesBycompanyId(_companyId, templateName, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-PostCompanyCustomizationEmailsRendering
    // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/rendering
    testEmailTemplateRendering(_companyId, body) { return this.restCompany.testEmailTemplateRendering(_companyId, body, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_customization_emails-ActivateOneCompanyCustomizationEmail
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/activation
    activateDesactivateEmailTemplate(_companyId, templateName, isActive) { return this.restCompany.activateDesactivateEmailTemplate(_companyId, templateName, isActive, this.account.companyId); }
    //endregion Companies Customization Emails

    //endregion Company

    //region Customisation Template
    // API https://api.openrainbow.org/admin/#api-customisation_template-ApplyCompanyTemplate
    // URL POST /api/rainbow/admin/v1.0/customisations/templates/apply
    applyCustomisationTemplates(name: string, companyId: string, userId: string) { return this.restCustomisationTemplate.applyCustomisationTemplates(name, companyId, userId); }
    // API https://api.openrainbow.org/admin/#api-customisation_template-CreateCompanyTemplate
    // URL POST /api/rainbow/admin/v1.0/customisations/templates
    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string, fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string, useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string, userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string) { return this.restCustomisationTemplate.createCustomisationTemplate(name, ownedByCompany, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics); }
    // API https://api.openrainbow.org/admin/#api-customisation_template-DeleteCompanyTemplate
    // URL delete /api/rainbow/admin/v1.0/customisations/templates/:templateId
    deleteCustomisationTemplate(templateId) { return this.restCustomisationTemplate.deleteCustomisationTemplate(templateId); }
    // API https://api.openrainbow.org/admin/#api-customisation_template-GetCustomisationTemplateAll
    // URL get /api/rainbow/admin/v1.0/customisations/templates
    getAllAvailableCustomisationTemplates(companyId: string = undefined, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restCustomisationTemplate.getAllAvailableCustomisationTemplates(companyId, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/admin/#api-customisation_template-GetCompanyTemplate
    // URL get /api/rainbow/admin/v1.0/customisations/templates/:templateId
    getRequestedCustomisationTemplate(templateId: string = undefined) { return this.restCustomisationTemplate.getRequestedCustomisationTemplate(templateId); }
    // API https://api.openrainbow.org/admin/#api-customisation_template-UpdateCompanyTemplate
    // URL PUT /api/rainbow/admin/v1.0/customisations/templates/:templateId
    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[], instantMessagesCustomisation: string = "enabled", useGifCustomisation: string = "enabled", fileSharingCustomisation: string = "enabled", fileStorageCustomisation: string = "enabled", phoneMeetingCustomisation: string = "enabled", useDialOutCustomisation: string = "enabled", useChannelCustomisation: string = "enabled", useRoomCustomisation: string = "enabled", useScreenSharingCustomisation: string = "enabled", useWebRTCAudioCustomisation: string = "enabled", useWebRTCVideoCustomisation: string = "enabled", recordingConversationCustomisation: string = "enabled", overridePresenceCustomisation: string = "enabled", userProfileCustomisation: string = "enabled", userTitleNameCustomisation: string = "enabled", changeTelephonyCustomisation: string = "enabled", changeSettingsCustomisation: string = "enabled", fileCopyCustomisation: string = "enabled", fileTransferCustomisation: string = "enabled", forbidFileOwnerChangeCustomisation: string = "enabled", readReceiptsCustomisation: string = "enabled", useSpeakingTimeStatistics: string = "enabled") { return this.restCustomisationTemplate.updateCustomisationTemplate(templateId, name, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics); }
    //endregion Customisation Template

    //region Channels
    // POST /api/rainbow/channels/v1.0/channels
    createPublicChannel(name, topic, category: string = "globalnews", visibility, max_items, max_payload_size) { return this.restChannels.createPublicChannel(name, topic, category, visibility, max_items, max_payload_size); }
    // DELETE /api/rainbow/channels/v1.0/channels/
    deleteChannel(channelId) { return this.restChannels.deleteChannel(channelId); }
    // GET /api/rainbow/channels/v1.0/channels/search
    findChannels(name, topic, category, limit, offset, sortField, sortOrder) { return this.restChannels.findChannels(name, topic, category, limit, offset, sortField, sortOrder); }
    // GET /api/rainbow/channels/v1.0/channels
    getChannels() { return this.restChannels.getChannels(); }
    // GET /api/rainbow/channels/v1.0/channels/
    getChannel(id) { return this.restChannels.getChannel(id); }
    // POST /api/rainbow/channels/v1.0/channels/
    publishMessage(channelId: string, message: string, title: string, url: string, imagesIds: Array<{id: string}> = undefined, type: string, customDatas: any = {}, attachments: Array<{id: string}> = undefined) { return this.restChannels.publishMessage(channelId, message, title, url, imagesIds, type, customDatas, attachments); }
    public getLatestMessages(maxMessages: number, beforeDate: Date = null, afterDate: Date = null) { return this.restChannels.getLatestMessages(maxMessages, beforeDate, afterDate); }
    // POST /api/rainbow/channels/v1.0/channels/
    subscribeToChannel(channelId) { return this.restChannels.subscribeToChannel(channelId); }
    // DELETE /api/rainbow/channels/v1.0/channels/
    unsubscribeToChannel(channelId) { return this.restChannels.unsubscribeToChannel(channelId); }
    // PUT /api/rainbow/channels/v1.0/channels/
    updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode) { return this.restChannels.updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode); }
    public uploadChannelAvatar(channelId: string, avatar: any, avatarSize: number, fileType: string): Promise<any> { return this.restChannels.uploadChannelAvatar(channelId, avatar, avatarSize, fileType); }
    public deleteChannelAvatar(channelId: string): Promise<any> { return this.restChannels.deleteChannelAvatar(channelId); }
    // GET /api/rainbow/channels/v1.0/channels/
    getChannelUsers(channelId, options) { return this.restChannels.getChannelUsers(channelId, options); }
    // DELETE /api/rainbow/channels/v1.0/channels/
    deleteAllUsersFromChannel(channelId) { return this.restChannels.deleteAllUsersFromChannel(channelId); }
    // PUT /api/rainbow/channels/v1.0/channels/
    updateChannelUsers(channelId, users) { return this.restChannels.updateChannelUsers(channelId, users); }
    // POST /api/rainbow/channels/v1.0/channels/
    getChannelMessages(channelId, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) { return this.restChannels.getChannelMessages(channelId, maxMessages, beforeDate, afterDate); }
    // POST /api/rainbow/channels/v1.0/channels/
    likeItem(channelId, itemId, appreciation) { return this.restChannels.likeItem(channelId, itemId, appreciation); }
    // GET /api/rainbow/channels/v1.0/channels/
    getDetailedAppreciations(channelId, itemId) { return this.restChannels.getDetailedAppreciations(channelId, itemId); }
    // DELETE /api/rainbow/channels/v1.0/channels/
    deleteChannelMessage(channelId, itemId) { return this.restChannels.deleteChannelMessage(channelId, itemId); }
    //endregion Channels

    //region Profiles

    // GET /api/rainbow/enduser/v1.0/users/
    async getServerProfiles() { return this.restProfiles.getServerProfiles(this.account?.id); }
    // GET /api/rainbow/enduser/v1.0/users/
    getServerProfilesFeatures() { return this.restProfiles.getServerProfilesFeatures(this.account?.id); }
    // GET /api/rainbow/authentication/v1.0/oauth/tokens?format=medium
    async getThirdPartyApps() { return this.restProfiles.getThirdPartyApps(); }
    // DELETE /api/rainbow/authentication/v1.0/oauth/tokens/
    async revokeThirdPartyAccess(tokenId) { return this.restProfiles.revokeThirdPartyAccess(tokenId); }

    //endregion Profiles

    ////////
    //region Telephony

    // POST /api/rainbow/telephony/v1.0/calls
    makeCall(contact, phoneInfo) {
        let that = this;
        return that.restTelephony.makeCall(that.getRequestHeader(), contact, phoneInfo);
    }

    // DELETE /api/rainbow/telephony/v1.0/calls/
    releaseCall(call) {
        let that = this;
        return that.restTelephony.releaseCall(that.getRequestHeader(), call);
    }

    // POST /api/rainbow/telephony/v1.0/calls/
    makeConsultationCall(callId, contact, phoneInfo) {
        let that = this;
        return that.restTelephony.makeConsultationCall(that.getRequestHeader(), callId, contact, phoneInfo);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    answerCall(call) {
        let that = this;
        return that.restTelephony.answerCall(that.getRequestHeader(), call);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    holdCall(call) {
        let that = this;
        return that.restTelephony.holdCall(that.getRequestHeader(), call);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    retrieveCall(call) {
        let that = this;
        return that.restTelephony.retrieveCall(that.getRequestHeader(), call);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    deflectCallToVM(call, VMInfos) {
        let that = this;
        return that.restTelephony.deflectCallToVM(that.getRequestHeader(), call, VMInfos);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    deflectCall(call, calleeInfos) {
        let that = this;
        return that.restTelephony.deflectCall(that.getRequestHeader(), call, calleeInfos);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    transfertCall(activeCall, heldCall) {
        let that = this;
        return that.restTelephony.transfertCall(that.getRequestHeader(), activeCall, heldCall);
    }

    // PUT /api/rainbow/telephony/v1.0/calls/
    conferenceCall(activeCall, heldCall) {
        let that = this;
        return that.restTelephony.conferenceCall(that.getRequestHeader(), activeCall, heldCall);
    }

    // POST /api/rainbow/telephony/v1.0/calls/forward
    forwardToDevice(contact, phoneInfo) {
        let that = this;
        return that.restTelephony.forwardToDevice(that.getRequestHeader(), contact, phoneInfo);
    }

    // GET /api/rainbow/telephony/v1.0/forward
    getForwardStatus() {
        let that = this;
        return that.restTelephony.getForwardStatus(that.getRequestHeader());
    }

    // GET /api/rainbow/telephony/v1.0/nomadic
    getNomadicStatus() {
        let that = this;
        return that.restTelephony.getNomadicStatus(that.getRequestHeader());
    }

    // PUT /api/rainbow/telephony/v1.0/nomadic/login
    nomadicLogin(data) {
        let that = this;
        return that.restTelephony.nomadicLogin(that.getRequestHeader(), data);
    }

    // POST /api/rainbow/telephony/v1.0/calls/
    sendDtmf(callId, deviceId, data) {
        let that = this;
        return that.restTelephony.sendDtmf(that.getRequestHeader(), callId, deviceId, data);
    }

    // POST /api/rainbow/telephony/v1.0/ccd/logon
    logon(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.logon(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    // POST /api/rainbow/telephony/v1.0/ccd/logoff
    logoff(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.logoff(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    // POST /api/rainbow/telephony/v1.0/ccd/withdrawal
    withdrawal(agentId, groupId, status) {
        let that = this;
        return that.restTelephony.withdrawal(that.getRequestHeader(), agentId, groupId, status);
    }

    // POST /api/rainbow/telephony/v1.0/ccd/wrapup
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

    // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
    // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
    deleteAllMyVoiceMessagesFromPbx() {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
        let that = this;
        return that.restTelephony.deleteAllMyVoiceMessagesFromPbx(that.getPostHeader());
    }

    // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
    // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
    deleteAVoiceMessageFromPbx(messageId) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
        let that = this;
        return that.restTelephony.deleteAVoiceMessageFromPbx(that.getPostHeader(), messageId);
    }

    // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read
    // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
    getAVoiceMessageFromPbx(messageId: string, messageDate: string, messageFrom: string) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read 
        // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
        let that = this;
        return that.restTelephony.getAVoiceMessageFromPbx(that.getRequestHeader(), messageId, messageDate, messageFrom);
    }

    // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list
    // GET /api/rainbow/telephony/v1.0/voicemessages
    getDetailedListOfVoiceMessages() {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list 
        // GET /api/rainbow/telephony/v1.0/voicemessages
        let that = this;
        return that.restTelephony.getDetailedListOfVoiceMessages(that.getRequestHeader());
    }

    // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
    // GET /api/rainbow/telephony/v1.0/voicemessages/counters
    getNumbersOfVoiceMessages() {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
        // GET /api/rainbow/telephony/v1.0/voicemessages/counters
        let that = this;
        return that.restTelephony.getNumbersOfVoiceMessages(that.getRequestHeader());
    }

    // endregion Telephony Voice Messages

    //endregion Telephony

    //region Conversations
    // API https://api.openrainbow.org/enduser/#api-conversations-countTextInConversations
    // GET /api/rainbow/enduser/v1.0/users/:userId/conversations/search
    getTheNumberOfHitsOfASubstringInAllUsersconversations(userId: string, substring: string, limit: number = 100, webinar: boolean = true) { return this.restConversations.getTheNumberOfHitsOfASubstringInAllUsersconversations(userId, substring, limit, webinar); }
    // GET /api/rainbow/enduser/v1.0/users/
    getServerConversations(format: string = "small", maxCount: number = undefined, lastUpdateDate: string = undefined, limit: number = 1000, offset: number = 0, before: number = 1) { return this.restConversations.getServerConversations(this.account?.id, format, maxCount, lastUpdateDate, limit, offset, before); }
    // POST /api/rainbow/enduser/v1.0/users/
    createServerConversation(conversation) { return this.restConversations.createServerConversation(this.account?.id, conversation); }
    // DELETE /api/rainbow/enduser/v1.0/users/
    deleteServerConversation(conversationId) { return this.restConversations.deleteServerConversation(this.account?.id, conversationId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    updateServerConversation(conversationId, mute) { return this.restConversations.updateServerConversation(this.account?.id, conversationId, mute); }
    // POST /api/rainbow/enduser/v1.0/users/
    sendConversationByEmail(conversationId, emails: Array<string> = undefined, lang: string = undefined) { return this.restConversations.sendConversationByEmail(this.account?.id, conversationId, emails, lang); }
    // PUT /api/rainbow/enduser/v1.0/users/
    ackAllMessages(conversationId, maskRead: boolean = false) { return this.restConversations.ackAllMessages(this.account?.id, conversationId, maskRead); }
    // API https://api.openrainbow.org/enduser/#api-conversations-setBookmarkInConversation
    // POST /api/rainbow/enduser/v1.0/users/:userId/conversations/:conversationId/bookmark
    updateConversationBookmark(userId: string, conversationId: string, messageId: string) { return this.restConversations.updateConversationBookmark(userId, conversationId, messageId); }
    // API https://api.openrainbow.org/enduser/#api-conversations-removeBookmarkInConversation
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/conversations/:conversationId/bookmark
    deleteConversationBookmark(userId: string, conversationId: string) { return this.restConversations.deleteConversationBookmark(userId, conversationId); }
    //endregion Conversations

    //region Country

    // API https://api.openrainbow.org/enduser/#api-countries-getCountries
    // GET /api/rainbow/enduser/v1.0/countries
    getListOfCountries() { return this.restCountry.getListOfCountries(); }

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
            if (!that.http) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkRESTAuthentication) REST that.http undefined.");
                authStatus = false;
            } else {
                let authenticationValidator = await that.http.get("/api/rainbow/authentication/v1.0/validator", that.getRequestHeader(), undefined);
                that._logger.log(that.DEBUG, LOG_ID + "(checkRESTAuthentication) REST authentication authenticationValidator : ", authenticationValidator);
                if (authenticationValidator.status==="OK") {
                    authStatus = true;
                }
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
    // GET /api/rainbow/ucs/v1.0/connections
    async listConnectionsS2S() { return this.restS2S.listConnectionsS2S(); }
    // PUT /api/rainbow/ucs/v1.0/connections/
    async sendS2SPresence(obj) { return this.restS2S.sendS2SPresence(obj, this.connectionS2SInfo?.id); }
    // DELETE /api/rainbow/ucs/v1.0/connections/
    async deleteConnectionsS2S(connexions) { return this.restS2S.deleteConnectionsS2S(connexions); }
    async loginS2S(callback_url) { const info = await this.restS2S.loginS2S(callback_url); this.connectionS2SInfo = info; return info; }
    // GET /api/rainbow/ucs/v1.0/connections/
    async infoS2S(s2sConnectionId) { return this.restS2S.infoS2S(s2sConnectionId); }
    async setS2SConnection(connectionId) { return this.connectionS2SInfo = await this.restS2S.setS2SConnection(connectionId); }
    // POST /api/rainbow/ucs/v1.0/connections/
    async sendS2SMessageInConversation(conversationId: string, msg: any) { return this.restS2S.sendS2SMessageInConversation(conversationId, msg, this.connectionS2SInfo?.id); }
    // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.reply
    // POST /api/rainbow/ucs/v1.0/connections/:connectionId/conversations/:conversationId/messages/:origMsgId/reply
    async sendS2SCorrectedChatMessage(conversationId: string, origMsgId: string, msg: any) { return this.restS2S.sendS2SCorrectedChatMessage(conversationId, origMsgId, msg, this.connectionS2SInfo?.id); }
    // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.forward
    // POST /api/rainbow/ucs/v1.0/connections/
    async sendS2SForwardChatMessage(conversationId: string, msgId: string, msg, conversationDestId: string) { return this.restS2S.sendS2SForwardChatMessage(conversationId, msgId, msg, conversationDestId, this.connectionS2SInfo?.id); }
    // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Conversation/operation/Conversation.chatstate
    // PUT /api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/chatstate/{state}
    sendS2SChatState(conversationId: string, state: CHATSTATE) { return this.restS2S.sendS2SChatState(conversationId, state, this.connectionS2SInfo?.id); }
    // GET /api/rainbow/ucs/v1.0/connections/
    async getS2SServerConversation(conversationId) { return this.restS2S.getS2SServerConversation(conversationId, this.connectionS2SInfo?.id); }
    // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.index
    // GET /api/rainbow/ucs/v1.0/connections/
    async getS2SMessagesByConversationId(conversationId, limit, before, after) { return this.restS2S.getS2SMessagesByConversationId(conversationId, limit, before, after, this.connectionS2SInfo?.id); }
    // HEAD /api/rainbow/ucs/v1.0/connections/
    async checkS2Sconnection() { return this.restS2S.checkS2Sconnection(this.connectionS2SInfo); }
    // POST /api/rainbow/ucs/v1.0/connections/
    async checkS2SAuthentication() { return this.restS2S.checkS2SAuthentication(this.connectionS2SInfo); }
    // POST /api/rainbow/ucs/v1.0/connections/
    async joinS2SRoom(roomid, role: ROOMROLE) { return this.restS2S.joinS2SRoom(roomid, role, this.connectionS2SInfo?.id); }
    //endregion

    //region IMS
    // POST /api/rainbow/ucs/v1.0/connections/
    retrieveXMPPMessagesByListOfMessageIds(ims: Array<any>) { return this.restConversations.retrieveXMPPMessagesByListOfMessageIds(this.userId, ims); }
    //endregion IMS

    //region Messages
    // GET /api/rainbow/ucs/v1.0/connections/
    showAllMatchingMessagesForAPeer(userId: string, substring: string, peer: string, isRoom: boolean = undefined, limit: number = 20) { return this.restConversations.showAllMatchingMessagesForAPeer(userId, substring, peer, isRoom, limit); }
    // PUT /api/rainbow/ucs/v1.0/connections/
    markMessageAsRead(conversationId, messageId) { return this.restConversations.markMessageAsRead(this.connectionS2SInfo?.id, conversationId, messageId); }
    // POST /api/rainbow/enduser/v1.0/users/:userId/pins/:types/:peerId
    addPinWithPeerId(peerId: string, types: any, body: any) { return this.restConversations.addPinWithPeerId(this.userId, peerId, types, body); }
    // GET /api/rainbow/enduser/v1.0/users/:userId/pins/:types/:peerId/:pinId
    getPinWithPeerIdById(types: any, peerId: string, pinId: string) { return this.restConversations.getPinWithPeerIdById(this.userId, types, peerId, pinId); }
    // GET /api/rainbow/enduser/v1.0/users/:userId/pins/:types/:peerId
    getAllPinsWithPeerId(types: any, peerId: string) { return this.restConversations.getAllPinsWithPeerId(this.userId, types, peerId); }
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/pins/:types/:peerId/:pinId
    removefromWithPeerIdAndPinId(types: string, peerId: string, pinId: string) { return this.restConversations.removefromWithPeerIdAndPinId(this.userId, types, peerId, pinId); }
    // PUT /api/rainbow/enduser/v1.0/users/:userId/pins/:types/:peerId/:pinId
    updatePinWithPeerId(peerId?: string, types?: any, pinId?: string, body?: any) { return this.restConversations.updatePinWithPeerId(this.userId, peerId, types, pinId, body); }
    //endregion Messages

    //region Public url
    // API https://api.openrainbow.org/enduser/#api-rooms-getRoomIdPublicLinks
    // GET /api/rainbow/enduser/v1.0/rooms/:roomId/public-links
    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent?: boolean, language?: string) { return this.restPublicUrl.getABubblePublicLinkAsModerator(bubbleId, emailContent, language); }
    // GET /api/rainbow/enduser/v1.0/users/
    getAllOpenInviteIdPerRoomOfAUser(userId?: string, type?: string, roomId?: string) { return this.restPublicUrl.getAllOpenInviteIdPerRoomOfAUser(userId, type, roomId, this.userId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    generateNewPublicUrl(bubbleId) { return this.restPublicUrl.generateNewPublicUrl(bubbleId, this.userId); }
    // PUT /api/rainbow/enduser/v1.0/users/
    removePublicUrl(bubbleId) { return this.restPublicUrl.removePublicUrl(bubbleId, this.userId); }
    // POST /api/rainbow/enduser/v1.0/users/
    createPublicUrl(bubbleId) { return this.restPublicUrl.createPublicUrl(bubbleId, this.userId); }
    // POST /api/rainbow/enduser/v1.0/users/self-register
    registerGuest(guest: GuestParams) { return this.restPublicUrl.registerGuest(guest); }
    //endregion Public url

    //region Bubble Open Invites

    // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-checkRoomInvitationUsingOpenInviteiId
    // GET /api/rainbow/enduser/v1.0/rooms/open-invites/validate
    checkOpenInviteIdValidity(openInviteId) { return this.restBubbleOpenInvites.checkOpenInviteIdValidity(openInviteId); }
    // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-sendJoinRoomInvitationUsingOpenInviteiId
    // POST /api/rainbow/enduser/v1.0/rooms/open-invites
    joinBubbleByOpenInviteId(openInviteId, roomPassword=undefined) { return this.restBubbleOpenInvites.joinBubbleByOpenInviteId(openInviteId, roomPassword); }

    //endregion Bubble Open Invites

    //region Conference

    // GET /api/rainbow/confprovisioning/v1.0/conferences
    retrieveAllConferences(scheduled) { return this.restConference.retrieveAllConferences(scheduled, this.userId); }
    // GET /api/rainbow/confprovisioning/v1.0/conferences
    retrieveWebConferences(mediaType="webrtc") { return this.restConference.retrieveWebConferences(mediaType, this.userId); }

    //endregion conference

    //region Offers and subscriptions
    // GET /api/rainbow/subscription/v1.0/companies/
    retrieveAllCompanyOffers(companyId: string, format: string = "small", name?: string, canBeSold?: boolean, autoSubscribe?: boolean, isExclusive?: boolean, isPrepaid?: boolean, profileId?: boolean, offerReference?: boolean, sapReference?: boolean, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restSubscriptions.retrieveAllCompanyOffers(companyId, format, name, canBeSold, autoSubscribe, isExclusive, isPrepaid, profileId, offerReference, sapReference, limit, offset, sortField, sortOrder); }
    // GET /api/rainbow/subscription/v1.0/companies/
    retrieveAllCompanySubscriptions(companyId: string, format: string = "small") { return this.restSubscriptions.retrieveAllCompanySubscriptions(companyId, format); }
    // POST /api/rainbow/subscription/v1.0/companies/
    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean) { return this.restSubscriptions.subscribeCompanyToOffer(companyId, offerId, maxNumberUsers, autoRenew); }
    // DELETE /api/rainbow/subscription/v1.0/companies/
    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string) { return this.restSubscriptions.unSubscribeCompanyToSubscription(companyId, subscriptionId); }
    // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
    subscribeUserToSubscription(userId: string, subscriptionId: string) { return this.restSubscriptions.subscribeUserToSubscription(userId, subscriptionId); }
    // DELETE /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
    unSubscribeUserToSubscription(userId: string, subscriptionId: string) { return this.restSubscriptions.unSubscribeUserToSubscription(userId, subscriptionId); }
    // API https://api.openrainbow.org/admin/#api-users_profiles-admin_users_GetUserProfiles
    // GET /api/rainbow/admin/v1.0/users/:userId/profiles
    getAUserProfiles(userId: string) { return this.restSubscriptions.getAUserProfiles(userId); }
    // GET /api/rainbow/enduser/v1.0/users/
    getAUserProfilesFeaturesByUserId(userId: string) { return this.restSubscriptions.getAUserProfilesFeaturesByUserId(userId); }
    //endregion Offers and subscriptions

    //region Bubbles Tags

    // GET /api/rainbow/enduser/v1.0/rooms/tags?
    retrieveAllBubblesByTags(tags, format="small", nbUsersToKeep=100) { return this.restBubblesTags.retrieveAllBubblesByTags(tags, format, nbUsersToKeep); }
    // PUT /api/rainbow/enduser/v1.0/rooms/
    setTagsOnABubble(roomId, tags) { return this.restBubblesTags.setTagsOnABubble(roomId, tags); }
    // DELETE /api/rainbow/enduser/v1.0/rooms/tags
    deleteTagOnABubble(roomIds, tag) { return this.restBubblesTags.deleteTagOnABubble(roomIds, tag); }

    //endregion Bubbles Tags

    //region Bubbles - dialIn

    // API https://api.openrainbow.org/enduser/#api-dialIn-DisableDialIn
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/disable
    disableDialInForARoom(roomId) { return this.restBubblesDialIn.disableDialInForARoom(roomId); }
    // API https://api.openrainbow.org/enduser/#api-dialIn-EnableDialIn
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/enable
    enableDialInForARoom(roomId) { return this.restBubblesDialIn.enableDialInForARoom(roomId); }
    // API https://api.openrainbow.org/enduser/#api-dialIn-ResetDialIn
    // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/reset
    resetDialInCodeForARoom(roomId) { return this.restBubblesDialIn.resetDialInCodeForARoom(roomId); }
    // API https://api.openrainbow.org/enduser/#api-dial_in_phone_numbers-GetDialInPhoneNumbers
    // GET /api/rainbow/enduser/v1.0/rooms/dial-in/phone-numbers
    getDialInPhoneNumbersList(shortList) { return this.restBubblesDialIn.getDialInPhoneNumbersList(shortList); }

    //endregion Bubbles - dialIn

    //region Alerts - Notifications — proxies → RESTAlerts

    // POST /api/rainbow/notificationsadmin/v1.0/devices
    createDevice(data: Object) { return this.restAlerts.createDevice(data); }
    // PUT /api/rainbow/notificationsadmin/v1.0/devices/
    updateDevice(deviceId, params: Object) { return this.restAlerts.updateDevice(deviceId, params); }
    // DELETE /api/rainbow/notificationsadmin/v1.0/devices/
    deleteDevice(deviceId: string) { return this.restAlerts.deleteDevice(deviceId); }
    // GET /api/rainbow/notificationsadmin/v1.0/devices/
    getDevice(deviceId: string) { return this.restAlerts.getDevice(deviceId); }
    // GET /api/rainbow/notificationsadmin/v1.0/devices
    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number, limit: number) { return this.restAlerts.getDevices(companyId, userId, deviceName, type, tag, offset, limit); }
    // GET /api/rainbow/notificationsadmin/v1.0/devices/tags
    getDevicesTags(companyId: string) { return this.restAlerts.getDevicesTags(companyId); }
    // PUT /api/rainbow/notificationsadmin/v1.0/templates
    renameDevicesTags(newTagName: string, tag: string, companyId: string) { return this.restAlerts.renameDevicesTags(newTagName, tag, companyId); }
    // DELETE /api/rainbow/notificationsadmin/v1.0/templates
    deleteDevicesTags(tag: string, companyId: string) { return this.restAlerts.deleteDevicesTags(tag, companyId); }
    // GET /api/rainbow/notificationsadmin/v1.0/templates
    getstatsTags(companyId: string) { return this.restAlerts.getstatsTags(companyId); }
    // POST /api/rainbow/notificationsadmin/v1.0/templates
    createTemplate(data: Object) { return this.restAlerts.createTemplate(data); }
    // PUT /api/rainbow/notificationsadmin/v1.0/templates/
    updateTemplate(templateId, params: Object) { return this.restAlerts.updateTemplate(templateId, params); }
    // DELETE /api/rainbow/notificationsadmin/v1.0/templates/
    deleteTemplate(templateId: string) { return this.restAlerts.deleteTemplate(templateId); }
    // GET /api/rainbow/notificationsadmin/v1.0/templates/
    getTemplate(templateId: string) { return this.restAlerts.getTemplate(templateId); }
    // GET /api/rainbow/notificationsadmin/v1.0/templates
    getTemplates(companyId: string, offset: number, limit: number) { return this.restAlerts.getTemplates(companyId, offset, limit); }
    // POST /api/rainbow/notificationsadmin/v1.0/filters
    createFilter(data: Object) { return this.restAlerts.createFilter(data); }
    // PUT /api/rainbow/notificationsadmin/v1.0/filters/
    updateFilter(FilterId, params: Object) { return this.restAlerts.updateFilter(FilterId, params); }
    // DELETE /api/rainbow/notificationsadmin/v1.0/filters/
    deleteFilter(FilterId: string) { return this.restAlerts.deleteFilter(FilterId); }
    // GET /api/rainbow/notificationsadmin/v1.0/filters/
    getFilter(templateId: string) { return this.restAlerts.getFilter(templateId); }
    // GET /api/rainbow/notificationsadmin/v1.0/filters
    getFilters(offset: number, limit: number) { return this.restAlerts.getFilters(offset, limit); }
    // POST /api/rainbow/notifications/v1.0/notifications
    createAlert(data: Object) { return this.restAlerts.createAlert(data); }
    // PUT /api/rainbow/notifications/v1.0/notifications/
    updateAlert(AlertId, params: Object) { return this.restAlerts.updateAlert(AlertId, params); }
    // DELETE /api/rainbow/notifications/v1.0/notifications/
    deleteAlert(AlertId: string) { return this.restAlerts.deleteAlert(AlertId); }
    // GET /api/rainbow/notifications/v1.0/notifications/
    getAlert(alertId: string) { return this.restAlerts.getAlert(alertId); }
    // GET /api/rainbow/notifications/v1.0/notifications
    getAlerts(offset: number, limit: number) { return this.restAlerts.getAlerts(offset, limit); }
    // POST /api/rainbow/notifications/v1.0/notifications/
    sendAlertFeedback(alertId: string, data: Object) { return this.restAlerts.sendAlertFeedback(alertId, data); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback
    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string) { return this.restAlerts.getAlertFeedbackSentForANotificationMessage(notificationHistoryId); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/feedback
    getAlertFeedbackSentForAnAlert(alertId: string) { return this.restAlerts.getAlertFeedbackSentForAnAlert(alertId); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback/stats
    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string) { return this.restAlerts.getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/
    getReportSummary(alertId: string) { return this.restAlerts.getReportSummary(alertId); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/
    getReportDetails(alertId: string) { return this.restAlerts.getReportDetails(alertId); }
    // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/reports/complete
    getReportComplete(alertId: string) { return this.restAlerts.getReportComplete(alertId); }

    //endregion Alerts - Notifications

    //region calendar
    // GET /api/rainbow/calendar/v1.0
    getCalendarState() { return this.restCalendar.getCalendarState(); }
    // POST /api/rainbow/calendar/v1.0/states
    getCalendarStates(users: Array<string> = [undefined]) { return this.restCalendar.getCalendarStates(users); }
    // POST /api/rainbow/calendar/v1.0/register
    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string) { return this.restCalendar.setCalendarRegister(type, redirect, callbackUrl); }
    // GET /api/rainbow/calendar/v1.0
    getCalendarAutomaticReplyStatus(userid?: string) { return this.restCalendar.getCalendarAutomaticReplyStatus(userid); }
    // PATCH /api/rainbow/calendar/v1.0
    enableOrNotCalendar(disable: boolean) { return this.restCalendar.enableOrNotCalendar(disable); }
    // API https://api.openrainbow.org/calendar/#api-Calendar-ControlCalendar
    // PUT /api/rainbow/calendar/v1.0/control
    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string) { return this.restCalendar.controlCalendarOrIgnoreAnEntry(disable, ignore); }
    // API https://api.openrainbow.org/calendar/#api-Calendar-UnregisterCalendar
    // DELETE /api/rainbow/calendar/v1.0
    unregisterCalendar() { return this.restCalendar.unregisterCalendar(); }
    //endregion

    //region MSTeams
    // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-ControlPresence
    // PUT /api/rainbow/msteamspresence/v1.0/control
    controlMsteamsPresence(disable?: boolean, ignore?: string) { return this.restCalendar.controlMsteamsPresence(disable, ignore); }
    // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-GetPresence
    // GET /api/rainbow/msteamspresence/v1.0
    getMsteamsPresenceState(userId: string) { return this.restCalendar.getMsteamsPresenceState(userId); }
    // POST /api/rainbow/msteamspresence/v1.0/states
    getMsteamsPresenceStates(users: Array<string> = []) { return this.restCalendar.getMsteamsPresenceStates(users); }
    // POST /api/rainbow/msteamspresence/v1.0/register
    registerMsteamsPresenceSharing(redirect?: boolean, callback?: string) { return this.restCalendar.registerMsteamsPresenceSharing(redirect, callback); }
    // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-unregisterPresence
    // DELETE /api/rainbow/msteamspresence/v1.0
    unregisterMsteamsPresenceSharing() { return this.restCalendar.unregisterMsteamsPresenceSharing(); }
    // POST /api/rainbow/msteamspresence/v1.0/activate
    activateMsteamsPresence() { return this.restCalendar.activateMsteamsPresence(); }
    // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-deactivatePresence
    // DELETE /api/rainbow/msteamspresence/v1.0/activate
    deactivateMsteamsPresence() { return this.restCalendar.deactivateMsteamsPresence(); }
    //endregion MSTeams

    //region AD/LDAP
    //region AD/LDAP Massprovisioning
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/check
    checkCSVdata(data?, companyId?, delimiter?, comment: string = "%") { return this.restAdLdap.checkCSVdata(data, companyId, delimiter, comment); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-DeleteReport
    // DELETE /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
    deleteAnImportStatusReport(reqId: string) { return this.restAdLdap.deleteAnImportStatusReport(reqId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetReport
    // GET /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
    getAnImportStatusReport(reqId?, format: string = "full") { return this.restAdLdap.getAnImportStatusReport(reqId, format); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-GetDirectoriesImportStatus
    // GET /api/rainbow/massprovisioning/v1.0/directories/imports/:companyId
    getAnImportStatus(companyId?) { return this.restAdLdap.getAnImportStatus(companyId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetImports
    // GET /api/rainbow/massprovisioning/v1.0/users/imports
    getInformationOnImports(companyId?, ldapConfigId?) { return this.restAdLdap.getInformationOnImports(companyId, ldapConfigId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskGet
    // GET /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
    getResultOfStartedOffice365TenantSynchronizationTask(tenant?, format: string = "json") { return this.restAdLdap.getResultOfStartedOffice365TenantSynchronizationTask(tenant, format); }
    // POST /api/rainbow/massprovisioning/v1.0/users/imports
    importCSVData(data?, companyId?, label: string = "none", noemails: boolean = true, nostrict: boolean = false, delimiter?, comment: string = "%") { return this.restAdLdap.importCSVData(data, companyId, label, noemails, nostrict, delimiter, comment); }
    // POST /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant?) { return this.restAdLdap.startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenant
    // GET /api/rainbow/massprovisioning/v1.0/users/synchronize/:tenant
    synchronizeOffice365TenantUserList(tenant?, format: string = "json") { return this.restAdLdap.synchronizeOffice365TenantUserList(tenant, format); }
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check
    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?, companyId?, delimiter?, comment: string = "%") { return this.restAdLdap.checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data, companyId, delimiter, comment); }
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/:commandId/report
    updateCommandIdStatus(data?, commandId?) { return this.restAdLdap.updateCommandIdStatus(data, commandId); }
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize
    synchronizeUsersAndDeviceswithCSV(CSVTxt?, companyId?, label: string = undefined, noemails: boolean = true, nostrict: boolean = false, delimiter?, comment: string = "%", commandId?, ldapConfigId?) { return this.restAdLdap.synchronizeUsersAndDeviceswithCSV(CSVTxt, companyId, label, noemails, nostrict, delimiter, comment, commandId, ldapConfigId); }
    // GET /api/rainbow/massprovisioning/v1.0/users/template
    getCSVTemplate(companyId?, mode: string = "useranddevice", comment?) { return this.restAdLdap.getCSVTemplate(companyId, mode, comment); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckSynchronizeCSV
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
    checkCSVforSynchronization(CSVTxt, companyId?, delimiter?, comment: string = "%", commandId?) { return this.restAdLdap.checkCSVforSynchronization(CSVTxt, companyId, delimiter, comment, commandId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetCheckSynchronizeCSV
    // GET /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/:commandId/report
    getCheckCSVReport(commandId: string) { return this.restAdLdap.getCheckCSVReport(commandId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-RainbowVoiceCSV
    // POST /api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice
    importRainbowVoiceUsersWithCSVdata(companyId: string, label: string = null, noemails: boolean = true, nostrict: boolean = false, delimiter: string = null, comment: string = "%", csvData: string) { return this.restAdLdap.importRainbowVoiceUsersWithCSVdata(companyId, label, noemails, nostrict, delimiter, comment, csvData); }
    // GET /api/rainbow/massprovisioning/v1.0/users/synchronize
    retrieveRainbowUserList(companyId?, format: string = "csv", ldap_id: boolean = true, ldapConfigId?) { return this.restAdLdap.retrieveRainbowUserList(companyId, format, ldap_id, ldapConfigId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-CheckSynchronizeCSV
    // POST /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check
    checkCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, csvData: string) { return this.restAdLdap.checkCSVdataForSynchronizeDirectory(delimiter, comment, commandId, csvData); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeData
    // POST /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize
    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string, ldapConfigId?) { return this.restAdLdap.importCSVdataForSynchronizeDirectory(delimiter, comment, commandId, label, csvData, ldapConfigId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
    // GET /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
    getCSVReportByCommandId(commandId: string) { return this.restAdLdap.getCSVReportByCommandId(commandId); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
    // POST /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
    createCSVReportByCommandId(commandId: string, data: any) { return this.restAdLdap.createCSVReportByCommandId(commandId, data); }
    // API https://api.openrainbow.org/mass-provisiong/#api-Directories-SynchronizeDirectories
    // GET /api/rainbow/massprovisioning/v1.0/directories/synchronize/
    retrieveRainbowEntriesList(companyId: string, format: string, ldap_id: boolean) { return this.restAdLdap.retrieveRainbowEntriesList(companyId, format, ldap_id); }
    //endregion Massprovisioning

    //region LDAP APIs to use:
    // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
    // POST /api/rainbow/admin/v1.0/connectors/ldaps/activate
    ActivateALdapConnectorUser(companyId: string = null) { return this.restAdLdap.ActivateALdapConnectorUser(companyId); }
    // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdap
    // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId
    deleteLdapConnector(ldapId: string) { return this.restAdLdap.deleteLdapConnector(ldapId); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetLdap
    // GET /api/rainbow/admin/v1.0/connectors/ldaps
    retrieveAllLdapConnectorUsersData(companyId?, format: string = "small", limit: number = 100, offset: number = undefined, sortField: string = "displayName", sortOrder: number = 1) { return this.restAdLdap.retrieveAllLdapConnectorUsersData(companyId, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/admin/#api-connectors-CommandLdap
    // POST /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId/command
    sendCommandToLdapConnectorUser(ldapId: string, command: string, ldapConfigId: string) { return this.restAdLdap.sendCommandToLdapConnectorUser(ldapId, command, ldapConfigId); }
    // API https://api.openrainbow.org/admin/#api-connectors-PostLdapConfig
    // POST /api/rainbow/admin/v1.0/connectors/ldaps/config
    createConfigurationForLdapConnector(companyId: string, settings: any, name: string, type: string = "ldap_config") { return this.restAdLdap.createConfigurationForLdapConnector(companyId, settings, name, type); }
    // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdapConfig
    // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId
    deleteLdapConnectorConfig(ldapConfigId: string) { return this.restAdLdap.deleteLdapConnectorConfig(ldapConfigId); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfig
    // GET /api/rainbow/admin/v1.0/connectors/ldaps/config
    retrieveLdapConnectorConfig(companyId: string, p_type?) { return this.restAdLdap.retrieveLdapConnectorConfig(companyId, p_type); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetLdapTemplate
    // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/template
    retrieveLdapConnectorConfigTemplate(type: string = "ldap_template") { return this.restAdLdap.retrieveLdapConnectorConfigTemplate(type); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapTemplate
    // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/templates
    retrieveLdapConnectorAllConfigTemplates() { return this.restAdLdap.retrieveLdapConnectorAllConfigTemplates(); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapConfigs
    // GET /api/rainbow/admin/v1.0/connectors/ldaps/configs
    retrieveLdapConnectorAllConfigs(companyId: string, supportMultiDomain: boolean = false) { return this.restAdLdap.retrieveLdapConnectorAllConfigs(companyId, supportMultiDomain); }
    // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfigById
    // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId
    retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId: string) { return this.restAdLdap.retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId); }
    // API https://api.openrainbow.org/admin/#api-connectors-PutLdapConfig
    // PUT /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId
    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean, name: string) { return this.restAdLdap.updateConfigurationForLdapConnector(ldapConfigId, settings, strict, name); }
    // API https://api.openrainbow.org/admin/#api-connectors-uploadLdapAvatar
    // POST /api/rainbow/admin/v1.0/connectors/ldaps/avatar
    uploadLdapAvatar(binaryImgFile: string, contentType: string = "", ldapId: string = null) { return this.restAdLdap.uploadLdapAvatar(binaryImgFile, contentType, ldapId); }
    // API https://api.openrainbow.org/admin/#api-connectors-deleteLdapAvatar
    // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/avatar
    deleteLdapAvatar(ldapId: string = null) { return this.restAdLdap.deleteLdapAvatar(ldapId); }
    //endregion LDAP APIs to use:
    //endregion AD/LDAP

    //region Connectors

    // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
    // POST /api/rainbow/admin/v1.0/connectors/events
    createListOfEventsForConnector(events) { return this.restConnectors.createListOfEventsForConnector(events); }

    //endregion Connectors
    
    //region Rainbow Voice Communication Platform Provisioning

    //region CloudPBX
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPbxById(systemId) { return this.restCloudPbx.getCloudPbxById(systemId); }
    // PUT /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    updateCloudPBX(systemId, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean) { return this.restCloudPbx.updateCloudPBX(systemId, barringOptions_permissions, barringOptions_restrictions, callForwardOptions_externalCallForward, customSipHeader_1, customSipHeader_2, emergencyOptions_callAuthorizationWithSoftPhone, emergencyOptions_emergencyGroupActivated, externalTrunkId, language, name, numberingDigits, numberingPrefix, outgoingPrefix, routeInternalCallsToPeer); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    deleteCloudPBX(systemId: string) { return this.restCloudPbx.deleteCloudPBX(systemId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string) { return this.restCloudPbx.getCloudPbxs(limit, offset, sortField, sortOrder, companyId, bpId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string) { return this.restCloudPbx.createACloudPBX(bpId, companyId, customSipHeader_1, customSipHeader_2, externalTrunkId, language, name, noReplyDelay, numberingDigits, numberingPrefix, outgoingPrefix, routeInternalCallsToPeer, siteId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/cli-options
    getCloudPBXCLIPolicyForOutboundCalls(systemId: string) { return this.restCloudPbx.getCloudPBXCLIPolicyForOutboundCalls(systemId); }
    // PUT /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/cli-options
    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: string) { return this.restCloudPbx.updateCloudPBXCLIOptionsConfiguration(systemId, policy); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/languages
    getCloudPBXlanguages(systemId: string) { return this.restCloudPbx.getCloudPBXlanguages(systemId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/devicemodels
    getCloudPBXDeviceModels(systemId: string) { return this.restCloudPbx.getCloudPBXDeviceModels(systemId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/barring-options
    getCloudPBXTrafficBarringOptions(systemId: string) { return this.restCloudPbx.getCloudPBXTrafficBarringOptions(systemId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/barring-options
    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string) { return this.restCloudPbx.getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId); }
    //endregion CloudPBX

    //region Companies Cloudpbx Groups (Rainbow Voice)
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PostCloudPbxGroup
    // URL POST /api/rainbow/admin/v1.0/companies/:companyId/groups
    createCloudPBXGroup(_companyId: string, huntingGroup) { return this.restCloudPbx.createCloudPBXGroup(_companyId, huntingGroup, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-DeleteCloudPbxGroup
    // DELETE /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
    deleteCloudPBXGroup(_companyId: string, groupId: string) { return this.restCloudPbx.deleteCloudPBXGroup(_companyId, groupId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetCloudPbxGroup
    // GET /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
    getCloudPBXGroup(_companyId: string, groupId: string) { return this.restCloudPbx.getCloudPBXGroup(_companyId, groupId, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroup
    // GET /api/rainbow/admin/v1.0/companies/:companyId/groups
    getAllCloudPBXGroups(_companyId?: string, sortField?: string, name?: string, shortNumber?: string, externalNumber?: string, memberId?: string, type?: string, limit?: number, offset?: number, sortOrder?: number) { return this.restCloudPbx.getAllCloudPBXGroups(_companyId, sortField, name, shortNumber, externalNumber, memberId, type, limit, offset, sortOrder, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroupMembers
    // GET /api/rainbow/admin/v1.0/companies/:companyId/group-members
    getMembersOfCloudPBXGroups(_companyId?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, displayName?: string, internalNumber?: string) { return this.restCloudPbx.getMembersOfCloudPBXGroups(_companyId, limit, offset, sortField, sortOrder, displayName, internalNumber, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutCloudPbxGroup
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
    updateCloudPBXGroup(_companyId?: string, groupId?: string, name?: string, policy?: "serial" | "parallel" | "circular", timeout?: number, externalNumberId?: string, isEmptyAllowed?: boolean, isDDIUpdateByManagerAllowed?: boolean, members?: {memberId: string, roles?: ("manager"|"agent"|"leader"|"assistant")[], status?: "active"|"idle"}[]) { return this.restCloudPbx.updateCloudPBXGroup(_companyId, groupId, name, policy, timeout, externalNumberId, isEmptyAllowed, isDDIUpdateByManagerAllowed, members, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutAnalyticsCloudPbxGroup
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/analytic-settings
    updateCloudPBXHuntingGroupAnalyticsConfiguration(_companyId?: string, groupId?: string, isManagersAllowedToSeeMembersAnalytics?: boolean) { return this.restCloudPbx.updateCloudPBXHuntingGroupAnalyticsConfiguration(_companyId, groupId, isManagersAllowedToSeeMembersAnalytics, this.account.companyId); }
    // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutRecordingCloudPbxGroup
    // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/recordings
    updateCloudPBXHuntingGroupRecordingConfiguration(_companyId?: string, groupId?: string, recordingProfile?: string) { return this.restCloudPbx.updateCloudPBXHuntingGroupRecordingConfiguration(_companyId, groupId, recordingProfile, this.account.companyId); }
    //endregion Companies Cloudpbx Groups (Rainbow Voice)

    //region Cloudpbx Devices
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string) { return this.restCloudPbx.CreateCloudPBXSIPDevice(systemId, description, deviceTypeId, macAddress); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string) { return this.restCloudPbx.factoryResetCloudPBXSIPDevice(systemId, deviceId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXSIPDeviceById(systemId: string, deviceId: string) { return this.restCloudPbx.getCloudPBXSIPDeviceById(systemId, deviceId); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    deleteCloudPBXSIPDevice(systemId: string, deviceId: string) { return this.restCloudPbx.deleteCloudPBXSIPDevice(systemId, deviceId); }
    // PUT /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string) { return this.restCloudPbx.updateCloudPBXSIPDevice(systemId, description, deviceId, macAddress); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getAllCloudPBXSIPDevice(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, assigned: boolean, phoneNumberId: string) { return this.restCloudPbx.getAllCloudPBXSIPDevice(systemId, limit, offset, sortField, sortOrder, assigned, phoneNumberId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string) { return this.restCloudPbx.getCloudPBXSIPRegistrationsInformationDevice(systemId, deviceId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string) { return this.restCloudPbx.grantCloudPBXAccessToDebugSession(systemId, deviceId, duration); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string) { return this.restCloudPbx.revokeCloudPBXAccessFromDebugSession(systemId, deviceId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    rebootCloudPBXSIPDevice(systemId: string, deviceId: string) { return this.restCloudPbx.rebootCloudPBXSIPDevice(systemId, deviceId); }
    //endregion Cloudpbx Devices

    //region Cloudpbx Subscribers
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXSubscriber(systemId: string, phoneNumberId: string) { return this.restCloudPbx.getCloudPBXSubscriber(systemId, phoneNumberId); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string) { return this.restCloudPbx.deleteCloudPBXSubscriber(systemId, phoneNumberId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/subscribers
    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string) { return this.restCloudPbx.createCloudPBXSubscriberRainbowUser(systemId, login, password, shortNumber, userId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/subscribers/:phoneNumberId/devices/:deviceId
    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string) { return this.restCloudPbx.getCloudPBXSIPdeviceAssignedSubscriber(systemId, phoneNumberId, deviceId); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string) { return this.restCloudPbx.removeCloudPBXAssociationSubscriberAndSIPdevice(systemId, phoneNumberId, deviceId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, phoneNumberId: string) { return this.restCloudPbx.getCloudPBXAllSIPdevicesAssignedSubscriber(systemId, limit, offset, sortField, sortOrder, phoneNumberId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string) { return this.restCloudPbx.getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId, phoneNumberId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string) { return this.restCloudPbx.assignCloudPBXSIPDeviceToSubscriber(systemId, phoneNumberId, deviceId, macAddress); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/:systemId/subscribers/:phoneNumberId/cli-options
    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string) { return this.restCloudPbx.getCloudPBXSubscriberCLIOptions(systemId, phoneNumberId); }
    //endregion Cloudpbx Subscribers

    //region Cloudpbx Phone Numbers
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    getCloudPBXUnassignedInternalPhonenumbers(systemId: string) { return this.restCloudPbx.getCloudPBXUnassignedInternalPhonenumbers(systemId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    listCloudPBXDDINumbersAssociated(systemId: string, limit: number = 100, offset: number, sortField: string = "number", sortOrder: number = 1, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean) { return this.restCloudPbx.listCloudPBXDDINumbersAssociated(systemId, limit, offset, sortField, sortOrder, isAssignedToUser, isAssignedToGroup, isAssignedToIVR, isAssignedToAutoAttendant, isAssigned); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    createCloudPBXDDINumber(systemId: string, number: string) { return this.restCloudPbx.createCloudPBXDDINumber(systemId, number); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string) { return this.restCloudPbx.deleteCloudPBXDDINumber(systemId, phoneNumberId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) { return this.restCloudPbx.associateCloudPBXDDINumber(systemId, phoneNumberId, userId); }
    // DELETE /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) { return this.restCloudPbx.disassociateCloudPBXDDINumber(systemId, phoneNumberId, userId); }
    // POST /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/
    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string) { return this.restCloudPbx.setCloudPBXDDIAsdefault(systemId, phoneNumberId); }
    //endregion Cloudpbx Phone Numbers

    //region Cloudpbx SIP Trunk
    // GET /api/rainbow/rvcpprovisioning/v1.0/external-trunks/:externalTrunkId
    retrieveExternalSIPTrunkById(externalTrunkId: string) { return this.restCloudPbx.retrieveExternalSIPTrunkById(externalTrunkId); }
    // GET /api/rainbow/rvcpprovisioning/v1.0/external-trunks
    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string) { return this.restCloudPbx.retrievelistExternalSIPTrunks(rvcpInstanceId, status, trunkType); }
    //endregion Cloudpbx SIP Trunk

    //endregion Rainbow Voice Communication Platform Provisioning
    //region Rainbow Voice
    // GET /api/rainbow/voice/v1.0/cli-options
    retrieveAllAvailableCallLineIdentifications() { return this.restRainbowVoice.retrieveAllAvailableCallLineIdentifications(); }
    // GET /api/rainbow/voice/v1.0/cli-options
    retrieveCurrentCallLineIdentification() { return this.restRainbowVoice.retrieveCurrentCallLineIdentification(); }
    // API https://api.openrainbow.org/voice/#api-CLI_Options-Set_CLI
    // PUT /api/rainbow/voice/v1.0/cli-options
    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string) { return this.restRainbowVoice.setCurrentActiveCallLineIdentification(policy, phoneNumberId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-add_user_to_group
    // POST /api/rainbow/voice/v1.0/groups/
    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string) { return this.restRainbowVoice.addMemberToGroup(groupId, memberId, position, roles, status); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-DeleteGroupVoiceMessage
    // DELETE /api/rainbow/voice/v1.0/groups/
    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string) { return this.restRainbowVoice.deleteVoiceMessageAssociatedToAGroup(groupId, messageId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupVoiceMessages
    // GET /api/rainbow/voice/v1.0/groups/:groupId/messages
    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) { return this.restRainbowVoice.getVoiceMessagesAssociatedToGroup(groupId, limit, offset, sortField, sortOrder, fromDate, toDate, callerName, callerNumber); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetCloudPbxGroupForwards
    // GET /api/rainbow/voice/v1.0/groups/
    getGroupForwards(groupId: string) { return this.restRainbowVoice.getGroupForwards(groupId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Get_User_groups
    // GET /api/rainbow/voice/v1.0/groups/
    getTheUserGroup(type: string) { return this.restRainbowVoice.getTheUserGroup(type); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_group
    // POST /api/rainbow/voice/v1.0/groups/
    joinAGroup(groupId: string) { return this.restRainbowVoice.joinAGroup(groupId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_all_groups
    // POST /api/rainbow/voice/v1.0/groups/join
    joinAllGroups() { return this.restRainbowVoice.joinAllGroups(); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_group
    // POST /api/rainbow/voice/v1.0/groups/
    leaveAGroup(groupId: string) { return this.restRainbowVoice.leaveAGroup(groupId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_all_groups
    // POST /api/rainbow/voice/v1.0/groups/leave
    leaveAllGroups() { return this.restRainbowVoice.leaveAllGroups(); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-remove_user_from_group
    // DELETE /api/rainbow/voice/v1.0/groups/
    removeMemberFromGroup(groupId: string, memberId: string) { return this.restRainbowVoice.removeMemberFromGroup(groupId, memberId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupsMessagesSummary
    // GET /api/rainbow/voice/v1.0/groups/
    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser() { return this.restRainbowVoice.retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser(); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroup
    // PUT /api/rainbow/voice/v1.0/groups/
    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean) { return this.restRainbowVoice.updateAGroup(groupId, externalNumberId, isEmptyAllowed); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-UpdateGroupVoiceMessage
    // PUT /api/rainbow/voice/v1.0/groups/
    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean) { return this.restRainbowVoice.updateAVoiceMessageAssociatedToAGroup(groupId, messageId, read); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroupForwards
    // PUT /api/rainbow/voice/v1.0/groups/
    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string) { return this.restRainbowVoice.updateGroupForward(groupId, callForwardType, destinationType, numberToForward, activate, noReplyDelay, managerIds, rvcpAutoAttendantId); }
    // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-update_member_inside_group
    // PUT /api/rainbow/voice/v1.0/groups/
    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string) { return this.restRainbowVoice.updateGroupMember(groupId, memberId, position, roles, status); }
    // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Dnd_state
    // PUT /api/rainbow/voice/v1.0/deskphones/dnd?activate=
    activateDeactivateDND(activate: boolean) { return this.restRainbowVoice.activateDeactivateDND(activate); }
    // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Forward_state
    // PUT /api/rainbow/voice/v1.0/deskphones/forwards/
    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number, activated: boolean) { return this.restRainbowVoice.configureAndActivateDeactivateForward(callForwardType, type, number, timeout, activated); }
    // API https://api.openrainbow.org/voice/#api-Deskphones-Get_active_forwards
    // GET /api/rainbow/voice/v1.0/deskphones/forwards
    retrieveActiveForwards() { return this.restRainbowVoice.retrieveActiveForwards(); }
    // API https://api.openrainbow.org/voice/#api-Deskphones-Get_Dnd_state
    // GET /api/rainbow/voice/v1.0/personalroutines/
    retrieveDNDState() { return this.restRainbowVoice.retrieveDNDState(); }
    // API https://api.openrainbow.org/voice/#api-Deskphones-Search_by_name
    // GET /api/rainbow/voice/v1.0/personalroutines/
    searchUsersGroupsContactsByName(displayName: string, limit: number) { return this.restRainbowVoice.searchUsersGroupsContactsByName(displayName, limit); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Activate_PersonalRoutine
    // POST /api/rainbow/voice/v1.0/personalroutines/
    activatePersonalRoutine(routineId: string) { return this.restRainbowVoice.activatePersonalRoutine(routineId); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Create_PersonalRoutine
    // POST /api/rainbow/voice/v1.0/personalroutines
    createCustomPersonalRoutine(name: string) { return this.restRainbowVoice.createCustomPersonalRoutine(name); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Delete_PersonalRoutine
    // DELETE /api/rainbow/voice/v1.0/personalroutines/
    deleteCustomPersonalRoutine(routineId: string) { return this.restRainbowVoice.deleteCustomPersonalRoutine(routineId); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutine
    // GET /api/rainbow/voice/v1.0/personalroutines/
    getPersonalRoutineData(routineId: string) { return this.restRainbowVoice.getPersonalRoutineData(routineId); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutines
    // GET /api/rainbow/voice/v1.0/personalroutines/
    getAllPersonalRoutines(userId) { return this.restRainbowVoice.getAllPersonalRoutines(userId); }
    // API https://api.openrainbow.org/voice/#api-Personal_Routines-Update_PersonalRoutine
    // PUT /api/rainbow/voice/v1.0/personalroutines/
    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: { manage: boolean, value: string }, deviceMode: { manage: boolean, mode: string }, immediateCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, busyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, noreplyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string, noReplyDelay: number }, huntingGroups: { withdrawAll: boolean }) { return this.restRainbowVoice.updatePersonalRoutineData(routineId, dndPresence, name, presence, deviceMode, immediateCallForward, busyCallForward, noreplyCallForward, huntingGroups); }
    // API https://api.openrainbow.org/voice/#api-Routing-Set_Routing
    // PUT /api/rainbow/voice/v1.0/routing
    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string) { return this.restRainbowVoice.manageUserRoutingData(destinations, currentDeviceId); }
    // API https://api.openrainbow.org/voice/#api-Routing-Get_Transfer_Routing
    // GET /api/rainbow/voice/v1.0/transfer-routing
    retrievetransferRoutingData(calleeId: string, addresseeId?: string, addresseePhoneNumber?: string) { return this.restRainbowVoice.retrievetransferRoutingData(calleeId, addresseeId, addresseePhoneNumber); }
    // API https://api.openrainbow.org/voice/#api-Routing-Get_Routing
    // GET /api/rainbow/voice/v1.0/calls/
    retrieveUserRoutingData() { return this.restRainbowVoice.retrieveUserRoutingData(); }
    // API https://api.openrainbow.org/voice/#api-Settings-Get_settings
    // GET /api/rainbow/voice/v1.0/calls/
    retrieveVoiceUserSettings() { return this.restRainbowVoice.retrieveVoiceUserSettings(); }
    // API https://api.openrainbow.org/voice/#api-Voice-Add_participant
    // POST /api/rainbow/voice/v1.0/calls/
    addParticipant3PCC(callId: string, callData: { callee: string }) { return this.restRainbowVoice.addParticipant3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Answer_call
    // POST /api/rainbow/voice/v1.0/calls/
    answerCall3PCC(callId: string, callData: { legId: string }) { return this.restRainbowVoice.answerCall3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Blind_Transfer_call
    // POST /api/rainbow/voice/v1.0/calls/
    blindTransferCall3PCC(callId: string, callData: { destination: { userId: string, resource: string } }) { return this.restRainbowVoice.blindTransferCall3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Deflect_call
    // POST /api/rainbow/voice/v1.0/calls/
    deflectCall3PCC(callId: string, callData: { destination: string }) { return this.restRainbowVoice.deflectCall3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Hold_call
    // POST /api/rainbow/voice/v1.0/calls/
    holdCall3PCC(callId: string, callData: { legId: string }) { return this.restRainbowVoice.holdCall3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Make_call
    // POST /api/rainbow/voice/v1.0/calls
    makeCall3PCC(callData: { deviceId: string, callerAutoAnswer: boolean, anonymous: boolean, calleeExtNumber: string, calleePbxId: string, calleeShortNumber: string, calleeCountry: string, dialPadCalleeNumber: string }) { return this.restRainbowVoice.makeCall3PCC(callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Merge_call
    // POST /api/rainbow/voice/v1.0/calls/
    mergeCall3PCC(activeCallId: string, callData: { heldCallId: string }) { return this.restRainbowVoice.mergeCall3PCC(activeCallId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Pickup_call
    // POST /api/rainbow/voice/v1.0/pickup
    pickupCall3PCC(callData: { deviceId: string, callerAutoAnswer: boolean, calleeShortNumber: string }) { return this.restRainbowVoice.pickupCall3PCC(callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Release_call
    // DELETE /api/rainbow/voice/v1.0/calls/
    releaseCall3PCC(callId: string, legId: string) { return this.restRainbowVoice.releaseCall3PCC(callId, legId); }
    // API https://api.openrainbow.org/voice/#api-Voice-Retrieve_call
    // POST /api/rainbow/voice/v1.0/calls/
    retrieveCall3PCC(callId: string, callData: { legId: string }) { return this.restRainbowVoice.retrieveCall3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-Send_DTMF
    // POST /api/rainbow/voice/v1.0/calls/
    sendDTMF3PCC(callId: string, callData: { legId: string, digits: string }) { return this.restRainbowVoice.sendDTMF3PCC(callId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-SnapshotCall
    // GET /api/rainbow/voice/v1.0/calls/
    snapshot3PCC(callId: string, deviceId: string, seqNum: number) { return this.restRainbowVoice.snapshot3PCC(callId, deviceId, seqNum); }
    // API https://api.openrainbow.org/voice/#api-Voice-Transfer_call
    // POST /api/rainbow/voice/v1.0/calls/
    transferCall3PCC(activeCallId: string, callData: { heldCallId: string }) { return this.restRainbowVoice.transferCall3PCC(activeCallId, callData); }
    // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessage
    // DELETE /api/rainbow/voice/v1.0/messages/:messageId
    deleteAVoiceMessage(messageId: string) { return this.restRainbowVoice.deleteAVoiceMessage(messageId); }
    // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessages
    // DELETE /api/rainbow/voice/v1.0/messages
    deleteAllVoiceMessages(messageId: string) { return this.restRainbowVoice.deleteAllVoiceMessages(messageId); }
    // API https://api.openrainbow.org/voice/#api-Voice-EmergencyNumbers
    // GET /api/rainbow/voice/v1.0/emergency-numbers
    getEmergencyNumbersAndEmergencyOptions() { return this.restRainbowVoice.getEmergencyNumbersAndEmergencyOptions(); }
    // API https://api.openrainbow.org/voice/#api-Voice-GetVoiceMessages
    // GET /api/rainbow/voice/v1.0/messages/
    getVoiceMessages(limit: number, offset: number, sortField: string, sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) { return this.restRainbowVoice.getVoiceMessages(limit, offset, sortField, sortOrder, fromDate, toDate, callerName, callerNumber); }
    // API https://api.openrainbow.org/voice/#api-Voice-Devices
    // GET /api/rainbow/voice/v1.0/messages/
    getUserDevices() { return this.restRainbowVoice.getUserDevices(); }
    // API https://api.openrainbow.org/voice/#api-Voice-UpdateVoiceMessage
    // PUT /api/rainbow/voice/v1.0/messages/
    updateVoiceMessage(messageId: string, urlData: { read: boolean }) { return this.restRainbowVoice.updateVoiceMessage(messageId, urlData); }
    // API https://api.openrainbow.org/voice/#api-Voice_Forward-Forward_call
    // PUT /api/rainbow/voice/v1.0/forwards/:callForwardType
    forwardCall(callForwardType: string, userId: string, urlData: { destinationType: string, number: string, activate: boolean, noReplyDelay: number }) { return this.restRainbowVoice.forwardCall(callForwardType, userId, urlData); }
    // API https://api.openrainbow.org/voice/#api-Voice_Forward-Get_Subscriber_call_forwards
    // PUT /api/rainbow/voice/v1.0/forwards
    getASubscriberForwards(userId: string) { return this.restRainbowVoice.getASubscriberForwards(userId); }
    // API https://api.openrainbow.org/voice/#api-Voice_Search_Hunting_Groups-Get_Cloud_PBX_Hunting_Groups
    // PUT /api/rainbow/voice/v1.0/search/huntinggroups
    searchCloudPBXhuntingGroups(name: string) { return this.restRainbowVoice.searchCloudPBXhuntingGroups(name); }
    //endregion Rainbow Voice


    //region Clients Versions
    // API https://api.openrainbow.org/admin/#api-clients_versions-PostClientsVersions
    // POST /api/rainbow/admin/v1.0/clientsversions
    createAClientVersion(id: string, version: string) { return this.restClientsVersions.createAClientVersion(id, version); }
    // API https://api.openrainbow.org/admin/#api-clients_versions-DeleteClientsVersions
    // DELETE /api/rainbow/admin/v1.0/clientsversions/
    deleteAClientVersion(clientId: string) { return this.restClientsVersions.deleteAClientVersion(clientId); }
    // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsVersionsId
    // GET /api/rainbow/admin/v1.0/clientsversions/
    getAClientVersionData(clientId: string) { return this.restClientsVersions.getAClientVersionData(clientId); }
    // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsversions
    // GET /api/rainbow/admin/v1.0/clientsversions/
    getAllClientsVersions(name?: string, typeClient?: string, limit: number = 100, offset?: number, sortField: string = "name", sortOrder: number = 1) { return this.restClientsVersions.getAllClientsVersions(name, typeClient, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/admin/#api-clients_versions-PutClientsVersions
    // PUT /api/rainbow/admin/v1.0/clientsversions/
    updateAClientVersion(clientId: string, version: string) { return this.restClientsVersions.updateAClientVersion(clientId, version); }
    //endregion Clients Versions

    //region sites
    // POST /api/rainbow/admin/v1.0/sites
    createASite(name: string, status: string, companyId: string) { return this.restSites.createASite(name, status, companyId); }
    // DELETE /api/rainbow/admin/v1.0/sites/
    deleteSite(siteId: string) { return this.restSites.deleteSite(siteId); }
    // GET /api/rainbow/admin/v1.0/sites/
    getSiteData(siteId: string) { return this.restSites.getSiteData(siteId); }
    // GET /api/rainbow/admin/v1.0/sites/
    getAllSites(format = "small", limit = 100, offset = 0, sortField = "name", sortOrder: number, name: string, companyId: string) { return this.restSites.getAllSites(format, limit, offset, sortField, sortOrder, name, companyId); }
    // PUT /api/rainbow/admin/v1.0/sites/
    updateSite(siteId: string, name: string, status: string, companyId: string) { return this.restSites.updateSite(siteId, name, status, companyId); }
    //endregion sites

    //region systems
    // API https://api.openrainbow.org/admin/#api-systems-PostSystems
    // POST /api/rainbow/admin/v1.0/systems
    createSystem(name: string, pbxId: string = undefined, pbxLdapId: string = undefined, siteId: string, type: string, country: string, version ?: string, serverPingTimeout ?: number, pbxMainBundlePrefix ?: Array<string>, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, activationCode ?: string, isCentrex ?: boolean, isShared ?: boolean, bpId ?: string, isOxoManaged ?: boolean) { return this.restSystems.createSystem(name, pbxId, pbxLdapId, siteId, type, country, version, serverPingTimeout, pbxMainBundlePrefix, usePbxMainBundlePrefix, pbxNumberingTranslator, pbxNationalPrefix, pbxInternationalPrefix, searchResultOrder, activationCode, isCentrex, isShared, bpId, isOxoManaged); }
    // API https://api.openrainbow.org/admin/#api-systems-DeleteSystems
    // DELETE /api/rainbow/admin/v1.0/systems/:systemId
    deleteSystem(systemId: string) { return this.restSystems.deleteSystem(systemId); }
    // API https://api.openrainbow.org/admin/#api-systems-GetSystemsConnectionState
    // GET /api/rainbow/admin/v1.0/systems/:systemId/state
    getSystemConnectionState(systemId: string, format: string = "small", connectionHistory?: boolean) { return this.restSystems.getSystemConnectionState(systemId, format, connectionHistory); }
    // API https://api.openrainbow.org/admin/#api-systems-GetSystemsIdByPbxId
    // GET /api/rainbow/admin/v1.0/systems/pbxid/:pbxId
    getSystemDataByPbxId(pbxId: string, connectionHistory?: boolean) { return this.restSystems.getSystemDataByPbxId(pbxId, connectionHistory); }
    // API https://api.openrainbow.org/admin/#api-systems-GetSystemsId
    // GET /api/rainbow/admin/v1.0/systems/:systemId
    getSystemData(systemId: string, connectionHistory?: boolean) { return this.restSystems.getSystemData(systemId, connectionHistory); }
    // API https://api.openrainbow.org/admin/#api-systems-GetSystems
    // GET /api/rainbow/admin/v1.0/systems
    getAllSystems(connectionHistory ?: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "pbxId", sortOrder: number = 1, name ?: string, type ?: string, status ?: string, siteId ?: string, companyId ?: string, bpId ?: string, isShared ?: boolean, isCentrex ?: boolean, isSharedOrCentrex ?: boolean, isOxoManaged ?: boolean, fromCreationDate ?: string, toCreationDate ?: string) { return this.restSystems.getAllSystems(connectionHistory, format, limit, offset, sortField, sortOrder, name, type, status, siteId, companyId, bpId, isShared, isCentrex, isSharedOrCentrex, isOxoManaged, fromCreationDate, toCreationDate); }
    // API https://api.openrainbow.org/admin/#api-systems-GetSystemsCountries
    // GET /api/rainbow/admin/v1.0/systems/countries
    getListOfCountriesAllowedForSystems() { return this.restSystems.getListOfCountriesAllowedForSystems(); }
    // API https://api.openrainbow.org/admin/#api-systems-PutSystems
    // PUT /api/rainbow/admin/v1.0/systems/:systemId
    updateSystem(systemId: string, name ?: string, siteId ?: string, pbxLdapId ?: string, type ?: string, country ?: string, version ?: string, serverPingTimeout: number = 100, pbxMainBundlePrefix ?: string, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, isShared ?: boolean, bpId ?: string) { return this.restSystems.updateSystem(systemId, name, siteId, pbxLdapId, type, country, version, serverPingTimeout, pbxMainBundlePrefix, usePbxMainBundlePrefix, pbxNumberingTranslator, pbxNationalPrefix, pbxInternationalPrefix, searchResultOrder, isShared, bpId); }
    // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbersId
    // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
    getASystemPhoneNumber(systemId: string, phoneNumberId: string) { return this.restSystems.getASystemPhoneNumber(systemId, phoneNumberId); }
    // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbers
    // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers
    getAllSystemPhoneNumbers(systemId: string, shortNumber?: string, internalNumber ?: string, pbxUserId ?: string, companyPrefix?: string, isMonitored ?: boolean, name ?: string, deviceName ?: string, isAssignedToUser ?: boolean, format: string = "small", limit: number = 100, offset ?: number, sortField: string = "shortNumber", sortOrder: number = 1) { return this.restSystems.getAllSystemPhoneNumbers(systemId, shortNumber, internalNumber, pbxUserId, companyPrefix, isMonitored, name, deviceName, isAssignedToUser, format, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-PutSystemPhoneNumbers
    // PUT /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
    updateASystemPhoneNumber(systemId: string, phoneNumberId: string, isMonitored ?: boolean, userId ?: string, internalNumber ?: string, number ?: string, type ?: string, deviceType ?: string, firstName ?: string, lastName ?: string, deviceName ?: string, isVisibleByOthers ?: boolean) { return this.restSystems.updateASystemPhoneNumber(systemId, phoneNumberId, isMonitored, userId, internalNumber, number, type, deviceType, firstName, lastName, deviceName, isVisibleByOthers); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxId
    // GET /api/rainbow/pcg/v1.0/pbxs/:pbxId
    getPbxData(pbxId: string) { return this.restSystems.getPbxData(pbxId); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxs
    // GET /api/rainbow/pcg/v1.0/pbxs
    getAllPbxs(format: string = "small", sortField: string = "id", limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, type: string = undefined, status: string = undefined, siteId: string = undefined, companyId: string = undefined, bpId: string = undefined, isShared: boolean = undefined, isCentrex: boolean = undefined, isSharedOrCentrex: boolean = undefined, isOxoManaged: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined) { return this.restSystems.getAllPbxs(format, sortField, limit, offset, sortOrder, name, type, status, siteId, companyId, bpId, isShared, isCentrex, isSharedOrCentrex, isOxoManaged, fromCreationDate, toCreationDate); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PostPcgPbxPhoneNb
    // POST /api/rainbow/pcg/v1.0/pbxs/
    createPbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) { return this.restSystems.createPbxPhoneNumber(pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, internalNumber, type, deviceType, firstName, lastName, deviceName); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-DeletePcgPbxPhoneNbShortNb
    // DELETE /api/rainbow/pcg/v1.0/pbxs/
    deletePbxPhoneNumber(pbxId: string, shortNumber: string) { return this.restSystems.deletePbxPhoneNumber(pbxId, shortNumber); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNbShortNb
    // GET /api/rainbow/pcg/v1.0/pbxs/
    getPbxPhoneNumber(pbxId: string, shortNumber: string) { return this.restSystems.getPbxPhoneNumber(pbxId, shortNumber); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNb
    // GET /api/rainbow/pcg/v1.0/pbxs/
    getAllPbxPhoneNumbers(pbxId: string, format: string = "small", shortNumber: string, internalNumber: string, pbxUserId: string, companyPrefix: string, isMonitored: boolean, name: string, nameOrShortNumber: string, deviceName: string, isAssignedToUser: boolean, limit: number = 100, offset: number, sortField: string = "shortNumber", sortOrder: number = 1) { return this.restSystems.getAllPbxPhoneNumbers(pbxId, format, shortNumber, internalNumber, pbxUserId, companyPrefix, isMonitored, name, nameOrShortNumber, deviceName, isAssignedToUser, limit, offset, sortField, sortOrder); }
    // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PutPcgPbxPhoneNbShortNb
    // PUT /api/rainbow/pcg/v1.0/pbxs/
    updatepbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, companyName: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) { return this.restSystems.updatepbxPhoneNumber(pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, companyName, internalNumber, type, deviceType, firstName, lastName, deviceName); }
    //endregion systems
    //endregion systems

    //region Rainbow Company Directory portal 
    // POST /api/rainbow/directory/v1.0/entries
    createDirectoryEntry(companyId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string) { return this.restDirectory.createDirectoryEntry(companyId, firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2); }
    // DELETE /api/rainbow/directory/v1.0/companies/
    deleteCompanyDirectoryAllEntry(companyId: string) { return this.restDirectory.deleteCompanyDirectoryAllEntry(companyId); }
    // API https://api.openrainbow.org/directory/#api-directory-DeleteDirectory
    // DELETE /api/rainbow/directory/v1.0/entries/:entryId
    deleteDirectoryEntry(entryId: string) { return this.restDirectory.deleteDirectoryEntry(entryId); }
    // GET /api/rainbow/directory/v1.0/entries/:entryId
    getDirectoryEntryData(entryId: string, format: string) { return this.restDirectory.getDirectoryEntryData(entryId, format); }
    // API https://api.openrainbow.org/directory/#api-directory-GetDirectoryList
    // GET /api/rainbow/directory/v1.0/entries
    getListDirectoryEntriesData(companyId: string, organisationIds: string, name: string, search: string, type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date, toUpdateDate: Date, tags: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number, view: string) { return this.restDirectory.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view); }
    // PUT /api/rainbow/directory/v1.0/entries/
    updateDirectoryEntry(entryId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string) { return this.restDirectory.updateDirectoryEntry(entryId, firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2); }
    // POST /api/rainbow/massprovisioning/v1.0/directories/imports
    ImportDirectoryCsvFile(companyId, csvContent, label) { return this.restDirectory.ImportDirectoryCsvFile(companyId, csvContent, label); }
    // GET /api/rainbow/directory/v1.0/entries/tags
    getAllTagsAssignedToDirectoryEntries(companyId: string) { return this.restDirectory.getAllTagsAssignedToDirectoryEntries(companyId); }
    // DELETE /api/rainbow/directory/v1.0/entries/tags
    removeTagFromAllDirectoryEntries(companyId: string, tag: string) { return this.restDirectory.removeTagFromAllDirectoryEntries(companyId, tag); }
    // PUT /api/rainbow/directory/v1.0/entries/tags
    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string) { return this.restDirectory.renameTagForAllAssignedDirectoryEntries(tag, companyId, newTagName); }
    // GET /api/rainbow/directory/v1.0/entries/tags/stats
    getStatsRegardingTagsOfDirectoryEntries(companyId: string) { return this.restDirectory.getStatsRegardingTagsOfDirectoryEntries(companyId); }
    //endregion Rainbow Company Directory portal

    //region Rainbow Bubbles Polls — proxies → RESTPolls

    // API https://api.openrainbow.org/enduser/#api-polls-Create_poll
    // POST /api/rainbow/enduser/v1.0/polls
    createBubblePoll(roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean = false, duration: number = 0) { return this.restPolls.createBubblePoll(roomId, title, questions, anonymous, duration); }
    // API https://api.openrainbow.org/enduser/#api-polls-Delete_poll
    // DELETE /api/rainbow/enduser/v1.0/polls/:pollId
    deleteBubblePoll(pollId) { return this.restPolls.deleteBubblePoll(pollId); }
    // API https://api.openrainbow.org/enduser/#api-polls-Get_a_poll
    // GET /api/rainbow/enduser/v1.0/polls/:pollId
    getBubblePoll(pollId: string, format: string = "small") { return this.restPolls.getBubblePoll(pollId, format); }
    // API https://api.openrainbow.org/enduser/#api-polls-Get_polls
    // GET /api/rainbow/enduser/v1.0/polls
    getBubblePollsByBubble(roomId: string, format: string = "small", limit: number = 100, offset: number) { return this.restPolls.getBubblePollsByBubble(roomId, format, limit, offset); }
    // API https://api.openrainbow.org/enduser/#api-polls-Publish_poll
    // PUT /api/rainbow/enduser/v1.0/polls/:pollId/publish
    publishBubblePoll(pollId: string) { return this.restPolls.publishBubblePoll(pollId); }
    // API https://api.openrainbow.org/enduser/#api-polls-Terminate_poll
    // PUT /api/rainbow/enduser/v1.0/polls/:pollId/terminate
    terminateBubblePoll(pollId: string) { return this.restPolls.terminateBubblePoll(pollId); }
    // API https://api.openrainbow.org/enduser/#api-polls-Unpublish_poll
    // PUT /api/rainbow/enduser/v1.0/polls/:pollId/unpublish
    unpublishBubblePoll(pollId: string) { return this.restPolls.unpublishBubblePoll(pollId); }
    // API https://api.openrainbow.org/enduser/#api-polls-Update_poll
    // PUT /api/rainbow/enduser/v1.0/polls/:pollId
    updateBubblePoll(pollId: string, roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean, duration: number) { return this.restPolls.updateBubblePoll(pollId, roomId, title, questions, anonymous, duration); }
    // API https://api.openrainbow.org/enduser/#api-polls-Votes_for_a_poll
    // PUT /api/rainbow/enduser/v1.0/polls/:pollId/vote
    votesForBubblePoll(pollId: string, votes: Array<{ question: number, answers: Array<number> }>) { return this.restPolls.votesForBubblePoll(pollId, votes); }

    //endregion Rainbow Bubbles Polls

    //region Conference v2
    // post /api/rainbow/conference/v1.0/rooms/:roomId/add
    addPSTNParticipantToConference(roomId: string, participantPhoneNumber: string, country: string) {
        let that = this;
        return that.restConferenceV2.addPSTNParticipantToConference(roomId, participantPhoneNumber, country);
    }

    askConferenceSnapshotV2(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.snapshotConference(roomId, limit, offset);
    }

    // GET /api/rainbow/conference/v1.0/rooms/:roomId/snapshot
    snapshotConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.restConferenceV2.snapshotConference(roomId, limit, offset);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/delegate
    delegateConference(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.delegateConference(roomId, userId);
    }

    // DELETE /api/rainbow/conference/v1.0/rooms/:roomId/phone-numbers
    disconnectPSTNParticipantFromConference(roomId: string) {
        let that = this;
        return that.restConferenceV2.disconnectPSTNParticipantFromConference(roomId);
    }

    // DELETE /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId
    disconnectParticipantFromConference(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.disconnectParticipantFromConference(roomId, userId);
    }

    // GET /api/rainbow/conference/v1.0/rooms/
    getTalkingTimeForAllPparticipantsInConference(roomId: string, limit: number = 100, offset: number = 0) {
        let that = this;
        return that.restConferenceV2.getTalkingTimeForAllPparticipantsInConference(roomId, limit, offset);
    }

    // API https://api.openrainbow.org/conference/#api-conference_v2-joinConferenceV2
    // POST /api/rainbow/conference/v1.0/rooms/:roomId/join
    joinConferenceV2(roomId: string, participantPhoneNumber: string = undefined, country: string = undefined, deskphone: boolean = false, dc: Array<string> = undefined, mute: boolean = false, microphone: boolean = false, media: Array<string> = undefined, resourceId: string = undefined) {
        let that = this;
        return that.restConferenceV2.joinConference(roomId, participantPhoneNumber, country, deskphone, dc, mute, microphone, media, resourceId);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/pause-recording
    pauseRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.pauseRecording(roomId);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/resume-recording
    resumeRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.resumeRecording(roomId);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/start-recording
    startRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.startRecording(roomId);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/stop-recording
    stopRecording(roomId: string) {
        let that = this;
        return that.restConferenceV2.stopRecording(roomId);
    }

    // PUT /api/rainbow/conference/v1.0/rooms/:roomId/reject
    rejectAVideoConference(roomId: string) {
        let that = this;
        return that.restConferenceV2.rejectAVideoConference(roomId);
    }

//Start a PSTN, WebRTC conference or a webinar in a room  () {
    // API https://api.openrainbow.org/conference/#api-conference_v2-startConferenceV2
    // POST /api/rainbow/conference/v1.0/rooms/
    startConferenceOrWebinarInARoom(roomId: string, services) {
        let that = this;
        return that.restConferenceV2.startConferenceOrWebinarInARoom(roomId, services);
    }

    // DELETE /api/rainbow/conference/v1.0/rooms/
    stopConferenceOrWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.stopConferenceOrWebinar(roomId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/subscribe
    subscribeForParticipantVideoStream(roomId: string, userId: string, media: string = "video", subStreamLevel: number = 0, dynamicFeed: boolean = false) {
        let that = this;
        return that.restConferenceV2.subscribeForParticipantVideoStream(roomId, userId, media, subStreamLevel, dynamicFeed);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/phone-numbers
    updatePSTNParticipantParameters(roomId: string, phoneNumber: string, option: string = " unmute") {
        let that = this;
        return that.restConferenceV2.updatePSTNParticipantParameters(roomId, phoneNumber, option);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/update
    updateConferenceParameters(roomId: string, option: string = "unmute") {
        let that = this;
        return that.restConferenceV2.updateConferenceParameters(roomId, option);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId
    updateParticipantParameters(roomId: string, userId: string, option: string, media: string, bitRate: number, subStreamLevel: number, publisherId: string) {
        let that = this;
        return that.restConferenceV2.updateParticipantParameters(roomId, userId, option, media, bitRate, subStreamLevel, publisherId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/allow-talk
    allowTalkWebinar(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.allowTalkWebinar(roomId, userId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/disable-talk
    disableTalkWebinar(roomId: string, userId: string) {
        let that = this;
        return that.restConferenceV2.disableTalkWebinar(roomId, userId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/lowerhand
    lowerHandWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.lowerHandWebinar(roomId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/raisehand
    raiseHandWebinar(roomId: string) {
        let that = this;
        return that.restConferenceV2.raiseHandWebinar(roomId);
    }

    // put /api/rainbow/conference/v1.0/rooms/:roomId/stage
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

    // GET /api/rainbow/webinar/v1.0/webinars/:webinarId
    getWebinarData(webinarId: string) {
        let that = this;
        return that.restWebinar.getWebinarData(webinarId);
    }

    // GET /api/rainbow/webinar/v1.0/webinars/
    getWebinarsData(role: string) {
        let that = this;
        return that.restWebinar.getWebinarsData(role);
    }

    // PUT /api/rainbow/webinar/v1.0/webinars/:webinarId/warn-moderators
    warnWebinarModerators(webinarId: string) {
        let that = this;
        return that.restWebinar.warnWebinarModerators(webinarId);
    }

    // PUT /api/rainbow/webinar/v1.0/webinars/:webinarId/publish
    publishAWebinarEvent(webinarId: string) {
        let that = this;
        return that.restWebinar.publishAWebinarEvent(webinarId);
    }

    // DELETE /api/rainbow/webinar/v1.0/webinars/:webinarId
    deleteWebinar(webinarId: string) {
        let that = this;
        return that.restWebinar.deleteWebinar(webinarId);
    }

    //endregion Webinar

    //region Room

    // POST /api/rainbow/room/v1.0/admin/rooms
    getRoomsAsAdmin(params?: any) { let that = this; return that.restRoom.getRoomsAsAdmin(params); }
    // GET /api/rainbow/room/v1.0/admin/rooms/
    createRoomAsAdmin(body: any) { let that = this; return that.restRoom.createRoomAsAdmin(body); }
    // PUT /api/rainbow/room/v1.0/admin/rooms/
    getRoomByIdAsAdmin(roomId: string, nbUsersToKeep?: number) { let that = this; return that.restRoom.getRoomByIdAsAdmin(roomId, nbUsersToKeep); }
    // DELETE /api/rainbow/room/v1.0/admin/rooms/
    updateRoomAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.updateRoomAsAdmin(roomId, body); }
    // PUT /api/rainbow/room/v1.0/admin/rooms/
    deleteRoomAsAdmin(roomId: string) { let that = this; return that.restRoom.deleteRoomAsAdmin(roomId); }
    // POST /api/rainbow/room/v1.0/admin/rooms/
    rehostRoomAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.rehostRoomAsAdmin(roomId, body); }
    // DELETE /api/rainbow/room/v1.0/admin/rooms/
    uploadRoomAvatarAsAdmin(roomId: string, binaryData: { data: any; type: string }) { let that = this; return that.restRoom.uploadRoomAvatarAsAdmin(roomId, binaryData); }
    // PUT /api/rainbow/room/v1.0/admin/rooms/
    deleteRoomAvatarAsAdmin(roomId: string) { let that = this; return that.restRoom.deleteRoomAvatarAsAdmin(roomId); }
    // PUT /api/rainbow/room/v1.0/admin/rooms/
    promoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.promoteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    // PUT /api/rainbow/room/v1.0/admin/rooms/
    demoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.demoteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    // GET /api/rainbow/room/v1.0/enduser/rooms/
    deleteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.deleteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    // POST /api/rainbow/room/v1.0/enduser/rooms/
    getMyPushToTalk(params?: any) { let that = this; return that.restRoom.getMyPushToTalk(params); }
    // GET /api/rainbow/ping
    clearRoomContent(roomId: string, body: any) { let that = this; return that.restRoom.clearRoomContent(roomId, body); }
    // GET /api/rainbow/room/v1.0/about
    getApiRainbowPing() { let that = this; return that.restRoom.getApiRainbowPing(); }
    // GET /api/rainbow/metrics
    getApiRainbowRoomV10About() { let that = this; return that.restRoom.getApiRainbowRoomV10About(); }
    // DELETE /api/rainbow/metrics
    getMetricsRoom() { let that = this; return that.restRoom.getMetrics(); }
    // PUT /api/rainbow/logs/levels
    deleteMetricsRoom() { let that = this; return that.restRoom.deleteMetrics(); }
    putApiRainbowLogsLevels(body: { console?: string; file?: string; syslog?: string }) { let that = this; return that.restRoom.putApiRainbowLogsLevels(body); }

    //endregion Room

    //region Customer Care
    // API https://api.openrainbow.org/customercare/#api-Administrators_group-GetCcareAdminsGroup
    // GET /api/rainbow/customercare/v1.0/administrators
    getCustomerCareAdministratorsGroup() { return this.restCustomerCare.getCustomerCareAdministratorsGroup(); }
    // API https://api.openrainbow.org/customercare/#api-Administrators_group-PostCcareAdminsGroup
    // POST /api/rainbow/customercare/v1.0/administrators/:userId
    addAdministratorToGroup(userId?: string) { return this.restCustomerCare.addAdministratorToGroup(userId || this.userId); }
    // API https://api.openrainbow.org/customercare/#api-Administrators_group-DeleteCcareAdminsGroup
    // DELETE /api/rainbow/customercare/v1.0/administrators/:userId
    removeAdministratorFromGroup(userId?: string) { return this.restCustomerCare.removeAdministratorFromGroup(userId || this.userId); }
    // API https://api.openrainbow.org/customercare/#api-Logs-getCcareOneLog
    // GET /api/rainbow/customercare/v1.0/logs/:logId
    getIssue(logId: string) { return this.restCustomerCare.getIssue(logId); }
    // API https://api.openrainbow.org/customercare/#api-Logs-getCcareLogs
    // GET /api/rainbow/customercare/v1.0/logs
    getListOfIssues(limit: number = 100, offset: number = 0, sortField: string = "creationDate", sortOrder: number = -1, companyId: string, bpId: string, customerCategory: string = "all", name: string, version: string, device: string, fromCreationDate: string, toCreationDate: string, fromOccurrenceDate: string, toOccurrenceDate: string, format: string = "small") { return this.restCustomerCare.getListOfIssues(limit, offset, sortField, sortOrder, companyId, bpId, customerCategory, name, version, device, fromCreationDate, toCreationDate, fromOccurrenceDate, toOccurrenceDate, format); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-GetCcareUsersLogs
    // GET /api/rainbow/customercare/v1.0/users/:userId/logs
    getListOfIssuesForUser(userId?: string, format: string = "small") { return this.restCustomerCare.getListOfIssuesForUser(userId || this.userId, format); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-GetCcareUsersOneLogs
    // GET /api/rainbow/customercare/v1.0/users/:userId/logs/:logId
    getIssueForUser(userId?: string, logId: string = undefined) { return this.restCustomerCare.getIssueForUser(userId || this.userId, logId); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogs
    // POST /api/rainbow/customercare/v1.0/users/:userId/logs
    initiateLogsContext(userId?: string, occurrenceDate: string = undefined, occurrenceDateTimezone: string = undefined, type: string = undefined, description: string = undefined, resourceId: string = undefined, externalRef: string = undefined, device: string = undefined, attachments: Array<string> = undefined, version: string = undefined, deviceDetails: any = undefined) { return this.restCustomerCare.initiateLogsContext(userId || this.userId, occurrenceDate, occurrenceDateTimezone, type, description, resourceId, externalRef, device, attachments, version, deviceDetails); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-PutCcareUsersLogs
    // PUT /api/rainbow/customercare/v1.0/users/:userId/logs/:logId
    completeLogsContext(userId?: string, logId: string = undefined, occurrenceDate: string = undefined, occurrenceDateTimezone: string = undefined, description: string = undefined, externalRef: string = undefined, device: string = undefined, attachments: Array<string> = undefined, version: string = undefined, deviceDetails: any = undefined) { return this.restCustomerCare.completeLogsContext(userId || this.userId, logId, occurrenceDate, occurrenceDateTimezone, description, externalRef, device, attachments, version, deviceDetails); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-DeleteCcareUsersLogs
    // DELETE /api/rainbow/customercare/v1.0/users/:userId/logs/:logId
    cancelOrCloseLogsSubmission(userId?: string, logId: string = undefined) { return this.restCustomerCare.cancelOrCloseLogsSubmission(userId || this.userId, logId); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogsReqAck
    // POST /api/rainbow/customercare/v1.0/users/:userId/logs/:logId/ack
    acknowledgeLogsRequest(userId?: string, logId: string = undefined) { return this.restCustomerCare.acknowledgeLogsRequest(userId || this.userId, logId); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs-PostCcareUsersLogsReqReject
    // POST /api/rainbow/customercare/v1.0/users/:userId/logs/:logId/reject
    rejectLogsRequest(userId?: string, logId: string = undefined) { return this.restCustomerCare.rejectLogsRequest(userId || this.userId, logId); }
    // API https://api.openrainbow.org/customercare/#api-Users_logs_append-PutCcareUsersLogsAttachments
    // PUT /api/rainbow/customercare/v1.0/users/:userId/logs/:logId/attachments
    adminOrBotAddAdditionalFiles(userId?: string, logId: string = undefined, attachments: Array<string> = undefined, conversationId: string = undefined, fileName: string = undefined) { return this.restCustomerCare.adminOrBotAddAdditionalFiles(userId || this.userId, logId, attachments, conversationId, fileName); }
    // API https://api.openrainbow.org/customercare/#api-Users_resources-GetCcareUsersResources
    // GET /api/rainbow/customercare/v1.0/users/:userId/resources
    getListOfResourcesForUser(userId?: string) { return this.restCustomerCare.getListOfResourcesForUser(userId || this.userId); }
    // API https://api.openrainbow.org/customercare/#api-Users_ticket-PostCcareUsersTicket
    // POST /api/rainbow/customercare/v1.0/users/:userId/ticket
    createAnAtriumTicket(userId?: string, subject: string = undefined, description: string = undefined, additionalDescription: string = undefined, resource: string = undefined, externalRef: string = undefined, logs: Array<string> = undefined) { return this.restCustomerCare.createAnAtriumTicket(userId || this.userId, subject, description, additionalDescription, resource, externalRef, logs); }
    // API https://api.openrainbow.org/customercare/#api-Users_ticket-PutCcareUsersTicket
    // PUT /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId
    updateAnAtriumTicket(userId?: string, ticketId: string = undefined, subject: string = undefined, description: string = undefined, additionalDescription: string = undefined, resource: string = undefined, externalRef: string = undefined, logs: Array<string> = undefined) { return this.restCustomerCare.updateAnAtriumTicket(userId || this.userId, ticketId, subject, description, additionalDescription, resource, externalRef, logs); }
    // API https://api.openrainbow.org/customercare/#api-Users_ticket-DeleteCcareUsersTicket
    // DELETE /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId
    deleteAnAtriumTicketInformation(userId?: string, ticketId: string = undefined) { return this.restCustomerCare.deleteAnAtriumTicketInformation(userId || this.userId, ticketId); }
    // API https://api.openrainbow.org/customercare/#api-Users_ticket-GetCcareUsersTicket
    // GET /api/rainbow/customercare/v1.0/users/:userId/ticket/:ticketId
    readAnAtriumTicketInformation(userId?: string, ticketId: string = undefined) { return this.restCustomerCare.readAnAtriumTicketInformation(userId || this.userId, ticketId); }
    // API https://api.openrainbow.org/customercare/#api-Users_ticket-GetAllCcareUsersTickets
    // GET /api/rainbow/customercare/v1.0/users/:userId/ticket
    readAllTicketsOnASameCompany(userId?: string) { return this.restCustomerCare.readAllTicketsOnASameCompany(userId || this.userId); }
    //endregion Customer Care

    //region Tasks MANAGEMENT — proxies → RESTTasks

    // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodo
    // POST /api/rainbow/enduser/v1.0/users/:userId/todos
    async addTask(task: any) { return this.restTasks.addTask(this.userId, task); }
    // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category
    getAllCategories() { return this.restTasks.getAllCategories(this.userId); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoCategory
    // POST /api/rainbow/enduser/v1.0/users/:userId/todos/category
    createTaskcategory(category: string) { return this.restTasks.createTaskcategory(this.userId, category); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-createTodoProperties
    // POST /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId
    createOrUpdatePropertiesTaskByCategoryId(categoryId: string, properties: any) { return this.restTasks.createOrUpdatePropertiesTaskByCategoryId(this.userId, categoryId, properties); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
    // GET /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
    async getTaskById(taskId: string) { return this.restTasks.getTaskById(this.userId, taskId); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-getTodoCategory
    // GET /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId
    getTasksByCategoryId(category: string) { return this.restTasks.getTasksByCategoryId(this.userId, category); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-GetUserTodos
    // GET /api/rainbow/enduser/v1.0/users/:userId/todos
    getTasks(category: string) { return this.restTasks.getTasks(this.userId, category); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategories
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/properties/:categoryId
    deletePropertiesFromCategoriesTasks(categoryId: string) { return this.restTasks.deletePropertiesFromCategoriesTasks(this.userId, categoryId); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodo
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
    deleteTask(taskId: string) { return this.restTasks.deleteTask(this.userId, taskId); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-removeTodoCategory
    // DELETE /api/rainbow/enduser/v1.0/users/:userId/todos/category/:categoryId
    deleteCategoryFromTasks(categoryId: string) { return this.restTasks.deleteCategoryFromTasks(this.userId, categoryId); }
    // API https://api.openrainbow.org/enduser/#api-to_do_list-updateTodo
    // PUT /api/rainbow/enduser/v1.0/users/:userId/todos/:todoId
    updateTask(taskId: string, task: TaskInput) { return this.restTasks.updateTask(this.userId, taskId, task); }

    //endregion Tasks MANAGEMENT

        //endregion Rainbow Voice Routing

    //region Rainbow APIs Settings

    // API https://api.openrainbow.org/enduser/#api-settings_apis-getApisSettings
    // GET /api/rainbow/enduser/v1.0/settings/apis
    getApisSettings() { return this.restApiSettings.getApisSettings(); }

    //endregion Rainbow APIs Settings

    //region Presence Synchronize CPE Exchange Calendar [AD/LDAP]
    // RQRAINB-12269 VBR
    // POST /api/rainbow/calendarprovider/v1.0/notify
    notifyCalendarProvider(ids: Array<string>, headers: any = {}, forceNotify: boolean = undefined) { return this.restCalendar.notifyCalendarProvider(ids, headers, forceNotify, this.userId, this._options?.httpOptions, this.account?.companyId); }
    //endregion Presence Synchronize CPE Exchange Calendar [AD/LDAP]
}

export {RESTService, MEDIATYPE, GuestParams};
module.exports.RESTService = RESTService;
module.exports.MEDIATYPE = MEDIATYPE;
module.exports.GuestParams = GuestParams;
