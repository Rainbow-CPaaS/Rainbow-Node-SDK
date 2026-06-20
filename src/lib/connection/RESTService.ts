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
    getRainbowSupportBotService() { return this.restBots.getRainbowSupportBotService(); }
    getABotServiceData(botId: string) { return this.restBots.getABotServiceData(botId); }
    getAllBotServices(format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restBots.getAllBotServices(format, limit, offset, sortField, sortOrder); }
    //endregion

    //region apikeys rainbow authentication
    deleteApiKey(apiKeyId: string) { return this.restAuth.deleteApiKey(apiKeyId); }
    generateApiKey(scope: Array<string> = ["all"], description: string = "", isActive: boolean = true, expirationDate?: string) { return this.restAuth.generateApiKey(scope, description, isActive, expirationDate); }
    getAllApiKey(isActive: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined, limit: number = 100, offset: number = 0, sortField: string = "creationDate", sortOrder: number = -1, format: string = "small", userId: string) { return this.restAuth.getAllApiKey(isActive, fromCreationDate, toCreationDate, limit, offset, sortField, sortOrder, format, userId); }
    getApiKey(apiKeyId: string = undefined) { return this.restAuth.getApiKey(apiKeyId); }
    getCurrentApiKey(apiKeyId: string = undefined) { return this.restAuth.getCurrentApiKey(apiKeyId); }
    updateApiKey(apiKeyId: string, description: string, isActive: boolean, expirationDate: string = undefined) { return this.restAuth.updateApiKey(apiKeyId, description, isActive, expirationDate); }
    //endregion apikeys rainbow authentication

    //region multifactor rainbow authentication
    deleteTrustedApplication(appId: string) { return this.restAuth.deleteTrustedApplication(this.account?.id, appId); }
    deleteAllTrustedApplications() { return this.restAuth.deleteAllTrustedApplications(this.account?.id); }
    disableMultifactorAuthentication() { return this.restAuth.disableMultifactorAuthentication(this.account?.id); }
    enableMultifactorAuthentication() { return this.restAuth.enableMultifactorAuthentication(this.account?.id); }
    getMultifactorInformation() { return this.restAuth.getMultifactorInformation(this.account?.id); }
    verifyMultifactorInformation(token) { return this.restAuth.verifyMultifactorInformation(this.account?.id, token); }
    resetRecoveryCodeForMultifactorAuthentication() { return this.restAuth.resetRecoveryCodeForMultifactorAuthentication(this.account?.id); }
    //endregion multifactor rainbow authentication

    //region Contacts API

    //region Contacts API - Search portal
    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format: string = "small", limit: number = 100, offset?: number, sortField: string = "reverseDisplayName", sortOrder: number = 1) { return this.restContacts.searchInAlldirectories(pbxId, systemId, numberE164, shortnumber, format, limit, offset, sortField, sortOrder); }
    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number) { return this.restContacts.searchInPhonebook(pbxId, name, number, format, limit, offset, sortField, sortOrder); }
    searchUserByPhonenumber(number: string) { return this.restContacts.searchUserByPhonenumber(number); }
    searchUsers(limit: number = 20, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder: number = 1) { return this.restContacts.searchUsers(limit, displayName, search, companyId, excludeCompanyId, offset, sortField, sortOrder); }
    //endregion Contacts API - Search portal

    //region Sources
    createSource(userId: string, sourceId: string, os: string) { return this.restContacts.createSource(this.account?.id, userId, sourceId, os); }
    deleteSource(userId: string, sourceId: string) { return this.restContacts.deleteSource(this.account?.id, userId, sourceId); }
    getSourceData(userId: string, sourceId: string) { return this.restContacts.getSourceData(this.account?.id, userId, sourceId); }
    getAllSourcesByUserId(userId: string, format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1) { return this.restContacts.getAllSourcesByUserId(this.account?.id, userId, format, sortField, limit, offset, sortOrder); }
    updateSourceData(userId: string, sourceId: string, os: string) { return this.restContacts.updateSourceData(this.account?.id, userId, sourceId, os); }
    updateContactData(userId: string, sourceId: string, contactIddb: string, contactId: string = undefined, firstName: string = undefined, lastName: string = undefined, displayName: string = undefined, company: string = undefined, jobTitle: string = undefined, phoneNumbers: Array<any> = undefined, emails: Array<any> = undefined, addresses: Array<any> = undefined, groups: Array<string> = undefined, otherData: Array<any> = undefined) { return this.restContacts.updateContactData(this.account?.id, userId, sourceId, contactIddb, contactId, firstName, lastName, displayName, company, jobTitle, phoneNumbers, emails, addresses, groups, otherData); }
    createContact(userId: string, sourceId: string, contactId: string, firstName: string, lastName: string, displayName: string, company: string, jobTitle: string, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) { return this.restContacts.createContact(this.account?.id, userId, sourceId, contactId, firstName, lastName, displayName, company, jobTitle, phoneNumbers, emails, addresses, groups, otherData); }
    getContactData(userId: string, sourceId: string, contactId: string) { return this.restContacts.getContactData(userId, sourceId, contactId); }
    getContactsList(userId: string, sourceId: string, format: string = "small") { return this.restContacts.getContactsList(userId, sourceId, format); }
    deleteContact(userId: string, sourceId: string, contactId: string) { return this.restContacts.deleteContact(this.account?.id, userId, sourceId, contactId); }
    //endregion Sources

    //region Contacts API - Enduser portal
    getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId?: string, searchEmail?: string) { return this.restContacts.getAllUsers(format, offset, limit, sortField, companyId, searchEmail, this.account?.companyId); }
    getAllUsersByFilter(phoneNumbers: number, phoneNumber: number = undefined, searchEmail: string = undefined, companyId: string = undefined, roles: string = "user", excludeRoles: string = undefined, tags: string = undefined, departments: string = undefined, isTerminated: string = "false", isActivated: string = undefined, fileSharingCustomisation: string = undefined, userTitleNameCustomisation: string = undefined, softphoneOnlyCustomisation: string = undefined, useRoomCustomisation: string = undefined, phoneMeetingCustomisation: string = undefined, useChannelCustomisation: string = undefined, useScreenSharingCustomisation: string = undefined, useWebRTCVideoCustomisation: string = undefined, useWebRTCAudioCustomisation: string = undefined, instantMessagesCustomisation: string = undefined, userProfileCustomisation: string = undefined, fileStorageCustomisation: string = undefined, overridePresenceCustomisation: string = undefined, alert: string = undefined, changeTelephonyCustomisation: string = undefined, changeSettingsCustomisation: string = undefined, recordingConversationCustomisation: string = undefined, useGifCustomisation: string = undefined, useDialOutCustomisation: string = undefined, fileCopyCustomisation: string = undefined, fileTransferCustomisation: string = undefined, forbidFileOwnerChangeCustomisation: string = undefined, readReceiptsCustomisation: string = undefined, useSpeakingTimeStatistics: string = undefined, selectedAppCustomisationTemplate: string = undefined, format: string = undefined, limit: string = undefined, offset: string = undefined, sortField: string = undefined, sortOrder: string = undefined, displayName: string = undefined, useEmails: boolean = undefined, companyName: string = undefined, loginEmail: string = undefined, email: string = undefined, visibility: string = undefined, organisationId: string = undefined, siteId: string = undefined, jid_im: string = undefined, jid_tel: string = undefined) { return this.restContacts.getAllUsersByFilter(phoneNumbers, phoneNumber, searchEmail, companyId, roles, excludeRoles, tags, departments, isTerminated, isActivated, fileSharingCustomisation, userTitleNameCustomisation, softphoneOnlyCustomisation, useRoomCustomisation, phoneMeetingCustomisation, useChannelCustomisation, useScreenSharingCustomisation, useWebRTCVideoCustomisation, useWebRTCAudioCustomisation, instantMessagesCustomisation, userProfileCustomisation, fileStorageCustomisation, overridePresenceCustomisation, alert, changeTelephonyCustomisation, changeSettingsCustomisation, recordingConversationCustomisation, useGifCustomisation, useDialOutCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics, selectedAppCustomisationTemplate, format, limit, offset, sortField, sortOrder, displayName, useEmails, companyName, loginEmail, email, visibility, organisationId, siteId, jid_im, jid_tel); }
    getContactInfos(userId) { return this.restContacts.getContactInfos(userId); }
    putContactInfos(userId, infos) { return this.restContacts.putContactInfos(userId, infos); }
    getContacts() { return this.restContacts.getContacts(); }
    removeContactFromRoster(dbId) { return this.restContacts.removeContactFromRoster(dbId); }
    getContactInformationByJID(jid) { return this.restContacts.getContactInformationByJID(jid); }
    getContactInformationByID(id) { return this.restContacts.getContactInformationByID(id); }
    getMyInformations() { return this.restContacts.getMyInformations(); }
    getContactsInformationByJIDs(jid_im: Array<string>, sortOrder: number = 1) { return this.restContacts.getContactsInformationByJIDs(jid_im, sortOrder); }
    getContactsInformationByIds(ids: Array<string>, sortOrder: number = 1) { return this.restContacts.getContactsInformationByIds(ids, sortOrder); }
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


    createUser(sendInvitationEmail: boolean = false, doNotAssignPaidLicense: boolean = false, mandatoryDefaultSubscription: boolean = false, companyId: string = undefined, loginEmail: string = undefined, customData: any = undefined, password: string = undefined, firstName: string = undefined, lastName: string = undefined, nickName: string = undefined, title: string = undefined, jobTitle: string = undefined, department: string = undefined, tags: Array<string> = undefined, emails: Array<any> = undefined, phoneNumbers: Array<any> = undefined, country: string = undefined, state: string = undefined, language: string = undefined, timezone: string = undefined, accountType: string = "free", roles: Array<string> = ["user"], adminType: string = undefined, isActive: boolean = true, isInitialized: boolean = false, visibility: string = undefined, timeToLive: number = -1, authenticationType: string = undefined, authenticationExternalUid: string = undefined, userInfo1: string = undefined, selectedTheme: string = undefined, userInfo2: string = undefined, isAdmin: boolean = false) { return this.restContacts.createUser(sendInvitationEmail, doNotAssignPaidLicense, mandatoryDefaultSubscription, companyId, loginEmail, customData, password, firstName, lastName, nickName, title, jobTitle, department, tags, emails, phoneNumbers, country, state, language, timezone, accountType, roles, adminType, isActive, isInitialized, visibility, timeToLive, authenticationType, authenticationExternalUid, userInfo1, selectedTheme, userInfo2, isAdmin); }
    createGuestUser(firstname, lastname, language, timeToLive) { return this.restContacts.createGuestUser(firstname, lastname, language, timeToLive, this.application?.appID, this.account?.companyId); }
    getAuthenticationUrls(params: {uid:string, country: string, uiLocales: string, useBackchannelPolling: boolean}) { return this.restContacts.getAuthenticationUrls(params); }
    registerUserByEmailFirstStep(userInfo: {"email":string,"lang":string}) { return this.restContacts.registerUserByEmailFirstStep(userInfo); }
    registerUserByEmailSecondStepWithToken(userLoginInfo: {"loginEmail":string,"password":string,"temporaryToken":string}) { return this.restContacts.registerUserByEmailSecondStepWithToken(userLoginInfo); }
    sendMessageNotification(data: any) { return this.restContacts.sendMessageNotification(data); }
    changePassword(password, userId) { return this.restContacts.changePassword(password, userId); }
    updateInformation(objData, userId) { return this.restContacts.updateInformation(objData, userId); }
    deleteUser(userId) { return this.restContacts.deleteUser(userId); }
    getUserExternalPresence(userId) { return this.restContacts.getUserExternalPresence(userId); }
    updateUserExternalPresence(userId, externalPresence) { return this.restContacts.updateUserExternalPresence(userId, externalPresence); }
    deleteUserExternalPresence(userId) { return this.restContacts.deleteUserExternalPresence(userId); }
    getCustomStatus(userId) { return this.restContacts.getCustomStatus(userId); }
    setCustomStatus(userId: string, customStatus: string, emoji: string, expirationDate: string) { return this.restContacts.setCustomStatus(userId, customStatus, emoji, expirationDate); }
    deleteCustomStatus(userId) { return this.restContacts.deleteCustomStatus(userId); }
    updateEndUserInformations(userId, objData) { return this.restContacts.updateEndUserInformations(userId, objData); }
    //endregion Contacts API - Enduser portal

    //region Enduser Themes API
    getThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) { return this.restContacts.getThemes(format, variant, limit, offset, sortField, sortOrder, name); }
    getUserThemes(userId, selectedThemeObj = false, variant = undefined) { return this.restContacts.getUserThemes(userId, selectedThemeObj, variant); }
    setUserTheme(userId, themeId, variant = undefined) { return this.restContacts.setUserTheme(userId, themeId, variant); }
    deleteUserThemes(userId, variant = undefined) { return this.restContacts.deleteUserThemes(userId, variant); }
    //endregion Enduser Themes API

    //region Admin Themes API
    getAdminThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) { return this.restContacts.getAdminThemes(format, variant, limit, offset, sortField, sortOrder, name); }
    getCompanyThemes(companyId, selectedThemeObj = false, variant = undefined) { return this.restContacts.getCompanyThemes(companyId, selectedThemeObj, variant); }
    createCompanyTheme(companyId, name, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) { return this.restContacts.createCompanyTheme(companyId, name, variant, description, isPublic, visibleBy, data); }
    updateCompanyTheme(companyId, themeId, name = undefined, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) { return this.restContacts.updateCompanyTheme(companyId, themeId, name, variant, description, isPublic, visibleBy, data); }
    deleteCompanyTheme(companyId, themeId) { return this.restContacts.deleteCompanyTheme(companyId, themeId); }
    //endregion Admin Themes API

    //endregion Contacts API

    //region Applications
    blockApplication(applicationId, reason) { return this.restApplications.blockApplication(applicationId, reason); }
    createApplication(name, platform, ownerId, isPublished, appKeyOnly, appKeyAndSecret, appKeyAndSecretAndJwt, appKeyAndJwtSecret, appKeyAndJwtAndSecret, appKeyAndJwtAndSecretAndRedirectUri) { return this.restApplications.createApplication(name, platform, ownerId, isPublished, appKeyOnly, appKeyAndSecret, appKeyAndSecretAndJwt, appKeyAndJwtSecret, appKeyAndJwtAndSecret, appKeyAndJwtAndSecretAndRedirectUri); }
    declineApplicationDeployment(applicationId: string, reason: string) { return this.restApplications.declineApplicationDeployment(applicationId, reason); }
    deleteApplication(applicationId: string) { return this.restApplications.deleteApplication(applicationId); }
    deployApplication(applicationId: string) { return this.restApplications.deployApplication(applicationId); }
    getAllApplicationsCreatedByUser(userId: string = undefined) { return this.restApplications.getAllApplicationsCreatedByUser(userId || this.userId); }
    getApplicationDataById(appId: string) { return this.restApplications.getApplicationDataById(appId); }
    getEmbedFrameForApplication(applicationId: string) { return this.restApplications.getEmbedFrameForApplication(applicationId); }
    getEmbeddingFrameForApplication(applicationId: string) { return this.restApplications.getEmbeddingFrameForApplication(applicationId); }
    renewExpiredApplication(applicationId: string) { return this.restApplications.renewExpiredApplication(applicationId); }
    requestDeploymentOfApplication(applicationId: string) { return this.restApplications.requestDeploymentOfApplication(applicationId); }
    restartApplication(applicationId: string) { return this.restApplications.restartApplication(applicationId); }
    stopApplication(applicationId: string) { return this.restApplications.stopApplication(applicationId); }
    unblockApplication(applicationId: string) { return this.restApplications.unblockApplication(applicationId); }
    updateApplication(applicationId: string, applicationData: object) { return this.restApplications.updateApplication(applicationId, applicationData); }
    getCountersForApplication(applicationId: string) { return this.restApplications.getCountersForApplication(applicationId); }
    updateCounterForApplication(applicationId: string, counterData: object) { return this.restApplications.updateCounterForApplication(applicationId, counterData); }
    //endregion Applications

    //region Favorites
    getServerFavorites(peerId: string = undefined) { return this.restSubscriptions.getServerFavorites(this.userId, peerId); }
    addServerFavorite(peerId: string, type: string, position: number) { return this.restSubscriptions.addServerFavorite(this.userId, peerId, type, position); }
    checkIsPeerSettedAsFavorite(peerId: string) { return this.restSubscriptions.checkIsPeerSettedAsFavorite(this.userId, peerId); }
    getFavoriteById(favoriteId: string) { return this.restSubscriptions.getFavoriteById(this.userId, favoriteId); }
    getAllUserFavoriteList(peerId: string) { return this.restSubscriptions.getAllUserFavoriteList(this.userId, peerId); }
    moveFavoriteToPosition(favoriteId: string, position: number) { return this.restSubscriptions.moveFavoriteToPosition(this.userId, favoriteId, position); }
    removeServerFavorite(favoriteId: string) { return this.restSubscriptions.removeServerFavorite(this.userId, favoriteId); }
    //endregion Favorites

    //region Invitations
    getAllSentInvitations() { return this.restInvitations.getAllSentInvitations(this.account?.id); }
    getInvitationsSent(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = undefined, sortOrder: number = 1) { return this.restInvitations.getInvitationsSent(this.account?.id, sortField, status, format, limit, offset, sortOrder); }
    getAllReceivedInvitations() { return this.restInvitations.getAllReceivedInvitations(this.account?.id); }
    getInvitationsReceived(sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = 0, sortOrder: number = 1) { return this.restInvitations.getInvitationsReceived(this.account?.id, sortField, status, format, limit, offset, sortOrder); }
    getServerInvitation(invitationId) { return this.restInvitations.getServerInvitation(this.account?.id, invitationId); }
    sendInvitationByCriteria(email: string, lang: string, customMessage: string, invitedPhoneNumber: string, invitedUserId: string) { return this.restInvitations.sendInvitationByCriteria(this.account?.id, email, lang, customMessage, invitedPhoneNumber, invitedUserId); }
    cancelOneSendInvitation(invitation) { return this.restInvitations.cancelOneSendInvitation(this.account?.id, invitation); }
    deleteAUserInvitation(invitation) { return this.restInvitations.deleteAUserInvitation(this.account?.id, invitation); }
    reSendInvitation(invitationId: string, customMessage: string) { return this.restInvitations.reSendInvitation(this.account?.id, invitationId, customMessage); }
    sendInvitationsByBulk(listOfMails, lang: string = undefined, customMessage: string = undefined) { return this.restInvitations.sendInvitationsByBulk(this.userId, listOfMails, lang, customMessage); }
    acceptInvitation(invitation) { return this.restInvitations.acceptInvitation(invitation); }
    declineInvitation(invitation) { return this.restInvitations.declineInvitation(invitation); }
    joinContactInvitation(contact) { return this.restInvitations.joinContactInvitation(this.account?.id, contact); }
    joinContacts(contact, contactIds, presence) { return this.restInvitations.joinContacts(contact, contactIds, presence); }
    getInvitationById(invitationId) { return this.restInvitations.getInvitationById(this.account?.id, invitationId); }
    //endregion Invitations

    //region Groups
    getGroups() { return this.restGroups.getGroups(this.account?.id); }
    getGroup(groupId: string) { return this.restGroups.getGroup(this.account?.id, groupId); }
    updateGroupFavorite(groupId: string, favorite: boolean) { return this.restGroups.updateGroupFavorite(this.account?.id, groupId, favorite); }
    createGroup(name: string, comment: string, isFavorite: boolean) { return this.restGroups.createGroup(this.account?.id, name, comment, isFavorite); }
    deleteGroup(groupId: string) { return this.restGroups.deleteGroup(this.account?.id, groupId); }
    updateGroupName(groupId: string, name: string) { return this.restGroups.updateGroupName(this.account?.id, groupId, name); }
    updateGroupComment(groupId: string, comment: string) { return this.restGroups.updateGroupComment(this.account?.id, groupId, comment); }
    addUserInGroup(contactId: string, groupId: string) { return this.restGroups.addUserInGroup(this.account?.id, contactId, groupId); }
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
    getUserPresenceInformation(userId: string = undefined) { return this.restPresence.getUserPresenceInformation(userId || this.userId); }
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

    createBubble(name, description, history="all", p_number=0, visibility="private", disableNotifications=false, autoRegister='unlock', autoAcceptInvitation=false, muteUponEntry=false, playEntryTone=true) { return this.restBubbles.createBubble(name, description, history, p_number, visibility, disableNotifications, autoRegister, autoAcceptInvitation, muteUponEntry, playEntryTone); }
    updateRoomData(bubbleId, data) { return this.restBubbles.updateRoomData(bubbleId, data); }
    setBubbleVisibility(bubbleId, visibility) { return this.restBubbles.setBubbleVisibility(bubbleId, visibility); }
    setBubbleAutoRegister(bubbleId, autoRegister="unlock") { return this.restBubbles.setBubbleAutoRegister(bubbleId, autoRegister); }
    setBubbleTopic(bubbleId, topic) { return this.restBubbles.setBubbleTopic(bubbleId, topic); }
    setBubbleName(bubbleId, name) { return this.restBubbles.setBubbleName(bubbleId, name); }
    getBubbleLastActivityDate(bubble) { return this.restBubbles.getBubbleLastActivityDate(bubble); }
    sortByDate(dateA, dateB) { return this.restBubbles.sortByDate(dateA, dateB); }
    getBubbles(format="small", unsubscribed=false) { return this.restBubbles.getBubbles(this.account?.id, format, unsubscribed); }
    getBubble(bubbleId, context=undefined, format="full", unsubscribed=true, nbUsersToKeep=100) { return this.restBubbles.getBubble(bubbleId, context, format, unsubscribed, nbUsersToKeep); }
    getBubbleByJid(bubbleJid, format="full", unsubscribed=true, nbUsersToKeep=100) { return this.restBubbles.getBubbleByJid(bubbleJid, format, unsubscribed, nbUsersToKeep); }
    getAllBubblesJidsOfAUserIsMemberOf(isActive?, webinar?, unsubscribed=true, limit=100, offset=0, sortField?, sortOrder=1) { return this.restBubbles.getAllBubblesJidsOfAUserIsMemberOf(isActive, webinar, unsubscribed, limit, offset, sortField, sortOrder); }
    getAllBubblesVisibleByTheUser(format="small", userId?, status?, confId?, scheduled?, hasConf?, isActive?, name?, sortField?, sortOrder=1, unsubscribed=false, webinar?, limit=100, offset=0, nbUsersToKeep=100, creator?, context?, needIsAlertNotificationEnabled="true") { return this.restBubbles.getAllBubblesVisibleByTheUser(format, userId, status, confId, scheduled, hasConf, isActive, name, sortField, sortOrder, unsubscribed, webinar, limit, offset, nbUsersToKeep, creator, context, needIsAlertNotificationEnabled, this.account?.id); }
    getBubblesDataByListOfBubblesIds(bubblesIds, format="small", userId?, status?, confId?, scheduled?, hasConf?, sortField?, sortOrder=1, unsubscribed=false, webinar?, limit=100, offset=0, nbUsersToKeep=100, context?, needIsAlertNotificationEnabled="true") { return this.restBubbles.getBubblesDataByListOfBubblesIds(bubblesIds, format, userId, status, confId, scheduled, hasConf, sortField, sortOrder, unsubscribed, webinar, limit, offset, nbUsersToKeep, context, needIsAlertNotificationEnabled); }
    setBubbleCustomData(bubbleId, customData) { return this.restBubbles.setBubbleCustomData(bubbleId, customData); }
    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) { return this.restBubbles.inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason); }
    inviteContactsByEmailsToBubble(contactsEmails, bubbleId) { return this.restBubbles.inviteContactsByEmailsToBubble(contactsEmails, bubbleId); }
    getRoomUsers(bubbleId, options={}) { return this.restBubbles.getRoomUsers(bubbleId, options); }
    promoteContactInBubble(contactId, bubbleId, asModerator) { return this.restBubbles.promoteContactInBubble(contactId, bubbleId, asModerator); }
    changeBubbleOwner(bubbleId, contactId) { return this.restBubbles.changeBubbleOwner(bubbleId, contactId); }
    archiveBubble(bubbleId) { return this.restBubbles.archiveBubble(bubbleId); }
    leaveBubble(bubbleId, bubbleStatus) { return this.restBubbles.leaveBubble(bubbleId, bubbleStatus, this.account?.id); }
    deleteBubble(bubbleId) { return this.restBubbles.deleteBubble(bubbleId); }
    setRoomHasPassword(roomId, hasPassword=false) { return this.restBubbles.setRoomHasPassword(roomId, hasPassword); }
    renewRoomPassword(roomId) { return this.restBubbles.renewRoomPassword(roomId); }
    setBubbleLobby(bubbleId, hasLobby) { return this.restBubbles.setBubbleLobby(bubbleId, hasLobby); }
    getBubbleLobby(bubbleId) { return this.restBubbles.getBubbleLobby(bubbleId); }
    acceptBubbleLobby(bubbleId, scope, users=undefined) { return this.restBubbles.acceptBubbleLobby(bubbleId, scope, users); }
    denyBubbleLobby(bubbleId, scope, users=undefined) { return this.restBubbles.denyBubbleLobby(bubbleId, scope, users); }
    removeInvitationOfContactToBubble(contactId, bubbleId) { return this.restBubbles.removeInvitationOfContactToBubble(contactId, bubbleId); }
    unsubscribeContactFromBubble(contactId, bubbleId) { return this.restBubbles.unsubscribeContactFromBubble(contactId, bubbleId); }
    acceptInvitationToJoinBubble(bubbleId) { return this.restBubbles.acceptInvitationToJoinBubble(bubbleId, this.account?.id); }
    declineInvitationToJoinBubble(bubbleId) { return this.restBubbles.declineInvitationToJoinBubble(bubbleId, this.account?.id); }
    deleteUserFromBubble(bubbleId) { return this.restBubbles.deleteUserFromBubble(bubbleId, this.account?.id); }
    inviteUser(email, _companyId, language, message) { return this.restBubbles.inviteUser(email, _companyId, language, message, this.account?.companyId); }
    setAvatarRoom(bubbleid, binaryData) { return this.restBubbles.setAvatarRoom(bubbleid, binaryData); }
    deleteAvatarRoom(roomId) { return this.restBubbles.deleteAvatarRoom(roomId); }
    getBubblesConsumption() { return this.restBubbles.getBubblesConsumption(); }
    getAllBubblesContainers(name=null) { return this.restBubbles.getAllBubblesContainers(name); }
    getABubblesContainersById(id=null) { return this.restBubbles.getABubblesContainersById(id); }
    addBubblesToContainerById(containerId, bubbleIds) { return this.restBubbles.addBubblesToContainerById(containerId, bubbleIds); }
    updateBubbleContainerNameAndDescriptionById(containerId, name, description?) { return this.restBubbles.updateBubbleContainerNameAndDescriptionById(containerId, name, description); }
    createBubbleContainer(name, description?, bubbleIds?) { return this.restBubbles.createBubbleContainer(name, description, bubbleIds); }
    deleteBubbleContainer(containerId) { return this.restBubbles.deleteBubbleContainer(containerId); }
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
    createFileDescriptor(name, extension, size, viewers, voicemessage: boolean, duration: number, encoding: boolean, ccarelogs: boolean, ccareclientlogs: boolean) { return this.restFileStorage.createFileDescriptor(name, extension, size, viewers, voicemessage, duration, encoding, ccarelogs, ccareclientlogs); }
    deleteFileDescriptor(fileId) { return this.restFileStorage.deleteFileDescriptor(fileId); }
    retrieveFileDescriptors(fileName: string, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, viewerId: string, path: string, limit: number = 1000, offset: number, sortField: string, sortOrder: number, format: string = "full") { return this.restFileStorage.retrieveFileDescriptors(fileName, extension, typeMIME, purpose, isUploaded, viewerId, path, limit, offset, sortField, sortOrder, format); }
    getAllConferenceRecords(roomName?: string, recordingName?: string, status?: string, roomId?: string, purpose?: string, fetch: string = "mine", isEphemeral?: boolean, limit: number = 100, offset: number = 0, sortField: string = "recordingStartDate", sortOrder: number = 1, format: string = "small") { return this.restFileStorage.getAllConferenceRecords(roomName, recordingName, status, roomId, purpose, fetch, isEphemeral, limit, offset, sortField, sortOrder, format); }
    updateOneConferenceRecordName(confrecid: string, recordingName: string) { return this.restFileStorage.updateOneConferenceRecordName(confrecid, recordingName); }
    getOneConferenceRecord(confrecid: string) { return this.restFileStorage.getOneConferenceRecord(confrecid); }
    deleteOneConferenceRecord(confrecid: string) { return this.restFileStorage.deleteOneConferenceRecord(confrecid); }
    deleteOneDocumentConferenceRecord(confrecid: string, fileId: string) { return this.restFileStorage.deleteOneDocumentConferenceRecord(confrecid, fileId); }
    getOneConferenceRecordExternalRef(registrationUuid: string) { return this.restFileStorage.getOneConferenceRecordExternalRef(registrationUuid); }
    retrieveFilesReceivedFromPeer(userId, peerId) { return this.restFileStorage.retrieveFilesReceivedFromPeer(userId, peerId); }
    retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId: string, fileName: boolean, extension: string, typeMIME: string, isUploaded: boolean, purpose: string, roomName: string, overall: boolean, format: string = "full", limit: number = 100, offset: number, sortField: string, sortOrder: number) { return this.restFileStorage.retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId, fileName, extension, typeMIME, isUploaded, purpose, roomName, overall, format, limit, offset, sortField, sortOrder); }
    retrieveOneFileDescriptor(fileId) { return this.restFileStorage.retrieveOneFileDescriptor(fileId); }
    retrieveUserConsumption() { return this.restFileStorage.retrieveUserConsumption(); }
    deleteFileViewer(viewerId, fileId) { return this.restFileStorage.deleteFileViewer(viewerId, fileId); }
    addFileViewer(fileId, viewerId, viewerType) { return this.restFileStorage.addFileViewer(fileId, viewerId, viewerType); }
    getFileDescriptorsByCompanyId(companyId, fileName: boolean, extension: string, typeMIME: string, purpose: string, isUploaded: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "fileName", sortOrder: number = 1) { return this.restFileStorage.getFileDescriptorsByCompanyId(companyId, fileName, extension, typeMIME, purpose, isUploaded, format, limit, offset, sortField, sortOrder); }
    copyFileInPersonalCloudSpace(fileId: string) { return this.restFileStorage.copyFileInPersonalCloudSpace(fileId); }
    fileOwnershipChange(fileId: string, userId: string) { return this.restFileStorage.fileOwnershipChange(fileId, userId); }
    //endregion FileStorage

    //region FileServer
    getPartialDataFromServer(url, minRange, maxRange, index) { return this.restFileStorage.getPartialDataFromServer(url, minRange, maxRange, index); }
    getPartialBufferFromServer(url, minRange, maxRange, index) { return this.restFileStorage.getPartialBufferFromServer(url, minRange, maxRange, index); }
    getFileFromUrl(url) { return this.restFileStorage.getFileFromUrl(url); }
    getBlobFromUrl(url) { return this.restFileStorage.getBlobFromUrl(url); }
    uploadAFile(fileId, buffer) { return this.restFileStorage.uploadAFile(fileId, buffer); }
    uploadABuffer(fileId, buffer) { return this.restFileStorage.uploadABuffer(fileId, buffer); }
    uploadAStream(fileId, stream) { return this.restFileStorage.uploadAStream(fileId, stream); }
    sendPartialDataToServer(fileId, file, index) { return this.restFileStorage.sendPartialDataToServer(fileId, file, index); }
    sendPartialFileCompletion(fileId) { return this.restFileStorage.sendPartialFileCompletion(fileId); }
    getFilesTemporaryURL(fileId: string) { return this.restFileStorage.getFilesTemporaryURL(fileId); }
    //endregion FileServer

    //region Settings

    getUserSettings() { return this.restSettings.getUserSettings(this.account?.id); }
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
    getAllCompanies(format?, sortField?, bpId?, catalogId?, offerId?, offerCanBeSold?, externalReference?, externalReference2?, salesforceAccountId?, selectedAppCustomisationTemplate?, selectedThemeObj?, offerGroupName?, limit?, offset?, sortOrder?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType, this.account.roles); }
    createCompany(name, country, state, offerType) { return this.restCompany.createCompany(name, country, state, offerType); }
    getCompany(companyId) { return this.restCompany.getCompany(companyId); }
    deleteCompany(companyId) { return this.restCompany.deleteCompany(companyId); }
    getCompanyInfos(companyId, format?, selectedThemeObj?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getCompanyInfos(companyId, format, selectedThemeObj, name, status, visibility, organisationId, isBP, hasBP, bpType); }
    getCompaniesBPBusinessType() { return this.restCompany.getCompaniesBPBusinessType(); }
    getCompanyAppFeatureCustomisation(_companyId) { return this.restCompany.getCompanyAppFeatureCustomisation(_companyId, this.account.companyId); }
    getCompanyServiceDescriptionFile(_companyId) { return this.restCompany.getCompanyServiceDescriptionFile(_companyId, this.account.companyId); }
    getDefaultCompanyData(format?, selectedThemeObj?) { return this.restCompany.getDefaultCompanyData(format, selectedThemeObj); }
    setCompanyAppFeatureCustomisation(_companyId, appFeaturesCustomisation) { return this.restCompany.setCompanyAppFeatureCustomisation(_companyId, appFeaturesCustomisation, this.account.companyId); }
    updateCompany(_companyId, selectedThemeObj, name, country, street, city, state, postalCode, offerType, currency, status, visibility, visibleBy, adminEmail, supportEmail, supportUrlFAQ, companyContactId, disableCCareAdminAccess, disableCCareAdminAccessCustomers, disableCCareAdminAccessResellers, autoAcceptUserInvitations, autoAddToUserNetwork, contentPolicyLifeTime, documentGracePeriod, userSelfRegisterAllowedDomains, slogan, description, size, economicActivityClassification, website, giphyEnabled, catalogId, adminCanSetCustomData, customData, bpId, adminHasRightToUpdateSubscriptions, adminAllowedUpdateSubscriptionsOps, isBP, bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpHasRightForBYOT, preferredSipLoadBalancerId, bpIsContractAccepted, externalReference, externalReference2, salesforceAccountId, avatarShape, isCentrex, companyCallNumber, superadminComment, bpBusinessType, billingModel, allowUsersSelectTheme, allowUsersSelectPublicTheme, selectedTheme, mobilePermanentConnectionMode, alertNotificationReception, alertNotificationSending, useDialOutCustomisation, allowDeviceFirmwareSelection, selectedDeviceFirmware, cloudPbxVoicemailToEmail, businessData, defaultLicenseGroup, defaultOptionsGroups, selectedThemeCustomers, allowTeamsToDesktopSso, cloudPbxRecordingInboundOnly, supervisionGroupMaxSize, supervisionGroupMaxNumber, supervisionGroupMaxUsers, timezone, sendPrepaidSubscriptionsNotification, ddiReadOnly, allowPhoneNumbersVisibility, csEmailList, seEmailList, csmEmailList, kamEmailList, businessSpecific, adminServiceNotificationsLevel) { return this.restCompany.updateCompany(_companyId, selectedThemeObj, name, country, street, city, state, postalCode, offerType, currency, status, visibility, visibleBy, adminEmail, supportEmail, supportUrlFAQ, companyContactId, disableCCareAdminAccess, disableCCareAdminAccessCustomers, disableCCareAdminAccessResellers, autoAcceptUserInvitations, autoAddToUserNetwork, contentPolicyLifeTime, documentGracePeriod, userSelfRegisterAllowedDomains, slogan, description, size, economicActivityClassification, website, giphyEnabled, catalogId, adminCanSetCustomData, customData, bpId, adminHasRightToUpdateSubscriptions, adminAllowedUpdateSubscriptionsOps, isBP, bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpHasRightForBYOT, preferredSipLoadBalancerId, bpIsContractAccepted, externalReference, externalReference2, salesforceAccountId, avatarShape, isCentrex, companyCallNumber, superadminComment, bpBusinessType, billingModel, allowUsersSelectTheme, allowUsersSelectPublicTheme, selectedTheme, mobilePermanentConnectionMode, alertNotificationReception, alertNotificationSending, useDialOutCustomisation, allowDeviceFirmwareSelection, selectedDeviceFirmware, cloudPbxVoicemailToEmail, businessData, defaultLicenseGroup, defaultOptionsGroups, selectedThemeCustomers, allowTeamsToDesktopSso, cloudPbxRecordingInboundOnly, supervisionGroupMaxSize, supervisionGroupMaxNumber, supervisionGroupMaxUsers, timezone, sendPrepaidSubscriptionsNotification, ddiReadOnly, allowPhoneNumbersVisibility, csEmailList, seEmailList, csmEmailList, kamEmailList, businessSpecific, adminServiceNotificationsLevel, this.account.companyId); }
    updateCompanyByObj(_companyId, selectedThemeObj, companyInfoToUpdate) { return this.restCompany.updateCompanyByObj(_companyId, selectedThemeObj, companyInfoToUpdate, this.account.companyId); }
    //endregion Company Management

    //region Companies RainbowMFA Settings
    createRainbowMultifactorAuthenticationServerConfiguration(_companyId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled) { return this.restCompany.createRainbowMultifactorAuthenticationServerConfiguration(_companyId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled, this.account.companyId); }
    deleteRainbowMultifactorConfiguration(_companyId, mfaId) { return this.restCompany.deleteRainbowMultifactorConfiguration(_companyId, mfaId, this.account.companyId); }
    getRainbowMultifactorConfiguration(_companyId, mfaId) { return this.restCompany.getRainbowMultifactorConfiguration(_companyId, mfaId, this.account.companyId); }
    getAllRainbowMultifactorConfiguration(_companyId, format?) { return this.restCompany.getAllRainbowMultifactorConfiguration(_companyId, format, this.account.companyId); }
    updateRainbowMultifactorAuthenticationConfiguration(_companyId, mfaId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled) { return this.restCompany.updateRainbowMultifactorAuthenticationConfiguration(_companyId, mfaId, enabledForAllCompanyUsers, mfaName, mfaType, mfaPolicy, rememberDaysApplication, mfaCanBeDisabled, this.account.companyId); }
    //endregion Companies RainbowMFA Settings

    //region Company join companies links
    createAJoinCompanyLink(_companyId, description?, isEnabled?, expirationDate?, maxNumberUsers?) { return this.restCompany.createAJoinCompanyLink(_companyId, description, isEnabled, expirationDate, maxNumberUsers, this.account.companyId); }
    deleteAJoinCompanyLink(_companyId, joinCompanyLinkId) { return this.restCompany.deleteAJoinCompanyLink(_companyId, joinCompanyLinkId, this.account.companyId); }
    getAJoinCompanyLink(companyId, joinCompanyLinkId) { return this.restCompany.getAJoinCompanyLink(companyId, joinCompanyLinkId); }
    getAllJoinCompanyLinks(_companyId, format?, createdByAdminId?, isEnabled?, fromExpirationDate?, toExpirationDate?, fromNbUsersRegistered?, toNbUsersRegistered?, limit?, offset?, sortField?, sortOrder?) { return this.restCompany.getAllJoinCompanyLinks(_companyId, format, createdByAdminId, isEnabled, fromExpirationDate, toExpirationDate, fromNbUsersRegistered, toNbUsersRegistered, limit, offset, sortField, sortOrder, this.account.companyId); }
    updateAJoinCompanyLink(_companyId, joinCompanyLinkId, description, isEnabled?, expirationDate?, maxNumberUsers?) { return this.restCompany.updateAJoinCompanyLink(_companyId, joinCompanyLinkId, description, isEnabled, expirationDate, maxNumberUsers, this.account.companyId); }
    //endregion Company join companies links

    //region Company from end user portal
    createCompanyFromDefault(name, visibility?, country?, state?, slogan?, description?, size?, economicActivityClassification?, website?, avatarShape?, giphyEnabled?) { return this.restCompany.createCompanyFromDefault(name, visibility, country, state, slogan, description, size, economicActivityClassification, website, avatarShape, giphyEnabled); }
    getAllCompaniesVisibleByUser(format?, sortField?, limit?, offset?, sortOrder?, name?, status?, visibility?, organisationId?, isBP?, hasBP?, bpType?) { return this.restCompany.getAllCompaniesVisibleByUser(format, sortField, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType); }
    getCompanyAdministrators(companyId, format?, limit?, offset?) { return this.restCompany.getCompanyAdministrators(companyId, format, limit, offset); }
    //endregion Company from end user portal

    //region Company visibility
    setVisibilityForCompany(companyId, visibleByCompanyId) { return this.restCompany.setVisibilityForCompany(companyId, visibleByCompanyId); }
    //endregion Company visibility

    //region Company join company invitations
    acceptJoinCompanyInvitation(invitationId) { return this.restCompany.acceptJoinCompanyInvitation(invitationId, this.userId); }
    declineJoinCompanyInvitation(invitationId) { return this.restCompany.declineJoinCompanyInvitation(invitationId, this.userId); }
    getJoinCompanyInvitation(invitationId) { return this.restCompany.getJoinCompanyInvitation(invitationId, this.userId); }
    getAllJoinCompanyInvitations(sortField?, status?, format?, limit?, offset?, sortOrder?) { return this.restCompany.getAllJoinCompanyInvitations(sortField, status, format, limit, offset, sortOrder, this.userId); }
    //endregion Company join company invitations

    //region Company join company requests
    cancelJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.cancelJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    getJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.getJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    getAllJoinCompanyRequests(sortField?, status?, format?, limit?, offset?, sortOrder?) { return this.restCompany.getAllJoinCompanyRequests(sortField, status, format, limit, offset, sortOrder, this.userId); }
    resendJoinCompanyRequest(joinCompanyRequestId) { return this.restCompany.resendJoinCompanyRequest(joinCompanyRequestId, this.userId); }
    requestToJoinCompany(requestedCompanyId?, requestedCompanyAdminId?, requestedCompanyLinkId?, lang?) { return this.restCompany.requestToJoinCompany(requestedCompanyId, requestedCompanyAdminId, requestedCompanyLinkId, lang, this.userId); }
    //endregion Company join company requests

    //region Companies Customization Emails
    getEmailTemplatesDocumentation(format) { return this.restCompany.getEmailTemplatesDocumentation(format); }
    initiateEmailTemplate(_companyId, templateName) { return this.restCompany.initiateEmailTemplate(_companyId, templateName, this.account.companyId); }
    updateSubjectPartTemplate(_companyId, templateName, body) { return this.restCompany.updateSubjectPartTemplate(_companyId, templateName, body, this.account.companyId); }
    updateMjmlFormatPartTemplate(_companyId, templateName, body) { return this.restCompany.updateMjmlFormatPartTemplate(_companyId, templateName, body, this.account.companyId); }
    updateTextFormatFormatPartTemplate(_companyId, templateName, body) { return this.restCompany.updateTextFormatFormatPartTemplate(_companyId, templateName, body, this.account.companyId); }
    getEmailTemplatesByCompanyId(_companyId, templateName, format) { return this.restCompany.getEmailTemplatesByCompanyId(_companyId, templateName, format, this.account.companyId); }
    deleteEmailTemplate(_companyId, templateName) { return this.restCompany.deleteEmailTemplate(_companyId, templateName, this.account.companyId); }
    deleteAvailableEmailTemplatesBycompanyId(_companyId, templateName) { return this.restCompany.deleteAvailableEmailTemplatesBycompanyId(_companyId, templateName, this.account.companyId); }
    testEmailTemplateRendering(_companyId, body) { return this.restCompany.testEmailTemplateRendering(_companyId, body, this.account.companyId); }
    activateDesactivateEmailTemplate(_companyId, templateName, isActive) { return this.restCompany.activateDesactivateEmailTemplate(_companyId, templateName, isActive, this.account.companyId); }
    //endregion Companies Customization Emails

    //endregion Company

    //region Customisation Template
    applyCustomisationTemplates(name: string, companyId: string, userId: string) { return this.restCustomisationTemplate.applyCustomisationTemplates(name, companyId, userId); }
    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string, fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string, useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string, userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string) { return this.restCustomisationTemplate.createCustomisationTemplate(name, ownedByCompany, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics); }
    deleteCustomisationTemplate(templateId) { return this.restCustomisationTemplate.deleteCustomisationTemplate(templateId); }
    getAllAvailableCustomisationTemplates(companyId: string = undefined, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restCustomisationTemplate.getAllAvailableCustomisationTemplates(companyId, format, limit, offset, sortField, sortOrder); }
    getRequestedCustomisationTemplate(templateId: string = undefined) { return this.restCustomisationTemplate.getRequestedCustomisationTemplate(templateId); }
    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[], instantMessagesCustomisation: string = "enabled", useGifCustomisation: string = "enabled", fileSharingCustomisation: string = "enabled", fileStorageCustomisation: string = "enabled", phoneMeetingCustomisation: string = "enabled", useDialOutCustomisation: string = "enabled", useChannelCustomisation: string = "enabled", useRoomCustomisation: string = "enabled", useScreenSharingCustomisation: string = "enabled", useWebRTCAudioCustomisation: string = "enabled", useWebRTCVideoCustomisation: string = "enabled", recordingConversationCustomisation: string = "enabled", overridePresenceCustomisation: string = "enabled", userProfileCustomisation: string = "enabled", userTitleNameCustomisation: string = "enabled", changeTelephonyCustomisation: string = "enabled", changeSettingsCustomisation: string = "enabled", fileCopyCustomisation: string = "enabled", fileTransferCustomisation: string = "enabled", forbidFileOwnerChangeCustomisation: string = "enabled", readReceiptsCustomisation: string = "enabled", useSpeakingTimeStatistics: string = "enabled") { return this.restCustomisationTemplate.updateCustomisationTemplate(templateId, name, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation, fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation, useRoomCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation, overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics); }
    //endregion Customisation Template

    //region Channels
    createPublicChannel(name, topic, category: string = "globalnews", visibility, max_items, max_payload_size) { return this.restChannels.createPublicChannel(name, topic, category, visibility, max_items, max_payload_size); }
    deleteChannel(channelId) { return this.restChannels.deleteChannel(channelId); }
    findChannels(name, topic, category, limit, offset, sortField, sortOrder) { return this.restChannels.findChannels(name, topic, category, limit, offset, sortField, sortOrder); }
    getChannels() { return this.restChannels.getChannels(); }
    getChannel(id) { return this.restChannels.getChannel(id); }
    publishMessage(channelId: string, message: string, title: string, url: string, imagesIds: Array<{id: string}> = undefined, type: string, customDatas: any = {}, attachments: Array<{id: string}> = undefined) { return this.restChannels.publishMessage(channelId, message, title, url, imagesIds, type, customDatas, attachments); }
    public getLatestMessages(maxMessages: number, beforeDate: Date = null, afterDate: Date = null) { return this.restChannels.getLatestMessages(maxMessages, beforeDate, afterDate); }
    subscribeToChannel(channelId) { return this.restChannels.subscribeToChannel(channelId); }
    unsubscribeToChannel(channelId) { return this.restChannels.unsubscribeToChannel(channelId); }
    updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode) { return this.restChannels.updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode); }
    public uploadChannelAvatar(channelId: string, avatar: any, avatarSize: number, fileType: string): Promise<any> { return this.restChannels.uploadChannelAvatar(channelId, avatar, avatarSize, fileType); }
    public deleteChannelAvatar(channelId: string): Promise<any> { return this.restChannels.deleteChannelAvatar(channelId); }
    getChannelUsers(channelId, options) { return this.restChannels.getChannelUsers(channelId, options); }
    deleteAllUsersFromChannel(channelId) { return this.restChannels.deleteAllUsersFromChannel(channelId); }
    updateChannelUsers(channelId, users) { return this.restChannels.updateChannelUsers(channelId, users); }
    getChannelMessages(channelId, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) { return this.restChannels.getChannelMessages(channelId, maxMessages, beforeDate, afterDate); }
    likeItem(channelId, itemId, appreciation) { return this.restChannels.likeItem(channelId, itemId, appreciation); }
    getDetailedAppreciations(channelId, itemId) { return this.restChannels.getDetailedAppreciations(channelId, itemId); }
    deleteChannelMessage(channelId, itemId) { return this.restChannels.deleteChannelMessage(channelId, itemId); }
    //endregion Channels

    //region Profiles

    async getServerProfiles() { return this.restProfiles.getServerProfiles(this.account?.id); }
    getServerProfilesFeatures() { return this.restProfiles.getServerProfilesFeatures(this.account?.id); }
    async getThirdPartyApps() { return this.restProfiles.getThirdPartyApps(); }
    async revokeThirdPartyAccess(tokenId) { return this.restProfiles.revokeThirdPartyAccess(tokenId); }

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
    getTheNumberOfHitsOfASubstringInAllUsersconversations(userId: string, substring: string, limit: number = 100, webinar: boolean = true) { return this.restConversations.getTheNumberOfHitsOfASubstringInAllUsersconversations(userId, substring, limit, webinar); }
    getServerConversations(format: string = "small", maxCount: number = undefined, lastUpdateDate: string = undefined, limit: number = 1000, offset: number = 0, before: number = 1) { return this.restConversations.getServerConversations(this.account?.id, format, maxCount, lastUpdateDate, limit, offset, before); }
    createServerConversation(conversation) { return this.restConversations.createServerConversation(this.account?.id, conversation); }
    deleteServerConversation(conversationId) { return this.restConversations.deleteServerConversation(this.account?.id, conversationId); }
    updateServerConversation(conversationId, mute) { return this.restConversations.updateServerConversation(this.account?.id, conversationId, mute); }
    sendConversationByEmail(conversationId, emails: Array<string> = undefined, lang: string = undefined) { return this.restConversations.sendConversationByEmail(this.account?.id, conversationId, emails, lang); }
    ackAllMessages(conversationId, maskRead: boolean = false) { return this.restConversations.ackAllMessages(this.account?.id, conversationId, maskRead); }
    updateConversationBookmark(userId: string, conversationId: string, messageId: string) { return this.restConversations.updateConversationBookmark(userId, conversationId, messageId); }
    deleteConversationBookmark(userId: string, conversationId: string) { return this.restConversations.deleteConversationBookmark(userId, conversationId); }
    //endregion Conversations

    //region Country

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
    async listConnectionsS2S() { return this.restS2S.listConnectionsS2S(); }
    async sendS2SPresence(obj) { return this.restS2S.sendS2SPresence(obj, this.connectionS2SInfo?.id); }
    async deleteConnectionsS2S(connexions) { return this.restS2S.deleteConnectionsS2S(connexions); }
    async loginS2S(callback_url) { const info = await this.restS2S.loginS2S(callback_url); this.connectionS2SInfo = info; return info; }
    async infoS2S(s2sConnectionId) { return this.restS2S.infoS2S(s2sConnectionId); }
    async setS2SConnection(connectionId) { return this.connectionS2SInfo = await this.restS2S.setS2SConnection(connectionId); }
    async sendS2SMessageInConversation(conversationId: string, msg: any) { return this.restS2S.sendS2SMessageInConversation(conversationId, msg, this.connectionS2SInfo?.id); }
    async sendS2SCorrectedChatMessage(conversationId: string, origMsgId: string, msg: any) { return this.restS2S.sendS2SCorrectedChatMessage(conversationId, origMsgId, msg, this.connectionS2SInfo?.id); }
    async sendS2SForwardChatMessage(conversationId: string, msgId: string, msg, conversationDestId: string) { return this.restS2S.sendS2SForwardChatMessage(conversationId, msgId, msg, conversationDestId, this.connectionS2SInfo?.id); }
    sendS2SChatState(conversationId: string, state: CHATSTATE) { return this.restS2S.sendS2SChatState(conversationId, state, this.connectionS2SInfo?.id); }
    async getS2SServerConversation(conversationId) { return this.restS2S.getS2SServerConversation(conversationId, this.connectionS2SInfo?.id); }
    async getS2SMessagesByConversationId(conversationId, limit, before, after) { return this.restS2S.getS2SMessagesByConversationId(conversationId, limit, before, after, this.connectionS2SInfo?.id); }
    async checkS2Sconnection() { return this.restS2S.checkS2Sconnection(this.connectionS2SInfo); }
    async checkS2SAuthentication() { return this.restS2S.checkS2SAuthentication(this.connectionS2SInfo); }
    async joinS2SRoom(roomid, role: ROOMROLE) { return this.restS2S.joinS2SRoom(roomid, role, this.connectionS2SInfo?.id); }
    //endregion

    //region IMS
    retrieveXMPPMessagesByListOfMessageIds(ims: Array<any>) { return this.restConversations.retrieveXMPPMessagesByListOfMessageIds(this.userId, ims); }
    //endregion IMS

    //region Messages
    showAllMatchingMessagesForAPeer(userId: string, substring: string, peer: string, isRoom: boolean = undefined, limit: number = 20) { return this.restConversations.showAllMatchingMessagesForAPeer(userId, substring, peer, isRoom, limit); }
    markMessageAsRead(conversationId, messageId) { return this.restConversations.markMessageAsRead(this.connectionS2SInfo?.id, conversationId, messageId); }
    addPinWithPeerId(peerId: string, types: any, body: any) { return this.restConversations.addPinWithPeerId(this.userId, peerId, types, body); }
    getPinWithPeerIdById(types: any, peerId: string, pinId: string) { return this.restConversations.getPinWithPeerIdById(this.userId, types, peerId, pinId); }
    getAllPinsWithPeerId(types: any, peerId: string) { return this.restConversations.getAllPinsWithPeerId(this.userId, types, peerId); }
    removefromWithPeerIdAndPinId(types: string, peerId: string, pinId: string) { return this.restConversations.removefromWithPeerIdAndPinId(this.userId, types, peerId, pinId); }
    updatePinWithPeerId(peerId?: string, types?: any, pinId?: string, body?: any) { return this.restConversations.updatePinWithPeerId(this.userId, peerId, types, pinId, body); }
    //endregion Messages

    //region Public url
    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent?: boolean, language?: string) { return this.restPublicUrl.getABubblePublicLinkAsModerator(bubbleId, emailContent, language); }
    getAllOpenInviteIdPerRoomOfAUser(userId?: string, type?: string, roomId?: string) { return this.restPublicUrl.getAllOpenInviteIdPerRoomOfAUser(userId, type, roomId, this.userId); }
    generateNewPublicUrl(bubbleId) { return this.restPublicUrl.generateNewPublicUrl(bubbleId, this.userId); }
    removePublicUrl(bubbleId) { return this.restPublicUrl.removePublicUrl(bubbleId, this.userId); }
    createPublicUrl(bubbleId) { return this.restPublicUrl.createPublicUrl(bubbleId, this.userId); }
    registerGuest(guest: GuestParams) { return this.restPublicUrl.registerGuest(guest); }
    //endregion Public url

    //region Bubble Open Invites

    checkOpenInviteIdValidity(openInviteId) { return this.restBubbleOpenInvites.checkOpenInviteIdValidity(openInviteId); }
    joinBubbleByOpenInviteId(openInviteId, roomPassword=undefined) { return this.restBubbleOpenInvites.joinBubbleByOpenInviteId(openInviteId, roomPassword); }

    //endregion Bubble Open Invites

    //region Conference

    retrieveAllConferences(scheduled) { return this.restConference.retrieveAllConferences(scheduled, this.userId); }
    retrieveWebConferences(mediaType="webrtc") { return this.restConference.retrieveWebConferences(mediaType, this.userId); }

    //endregion conference

    //region Offers and subscriptions
    retrieveAllCompanyOffers(companyId: string, format: string = "small", name?: string, canBeSold?: boolean, autoSubscribe?: boolean, isExclusive?: boolean, isPrepaid?: boolean, profileId?: boolean, offerReference?: boolean, sapReference?: boolean, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) { return this.restSubscriptions.retrieveAllCompanyOffers(companyId, format, name, canBeSold, autoSubscribe, isExclusive, isPrepaid, profileId, offerReference, sapReference, limit, offset, sortField, sortOrder); }
    retrieveAllCompanySubscriptions(companyId: string, format: string = "small") { return this.restSubscriptions.retrieveAllCompanySubscriptions(companyId, format); }
    subscribeCompanyToOffer(companyId: string, offerId: string, maxNumberUsers?: number, autoRenew?: boolean) { return this.restSubscriptions.subscribeCompanyToOffer(companyId, offerId, maxNumberUsers, autoRenew); }
    unSubscribeCompanyToSubscription(companyId: string, subscriptionId: string) { return this.restSubscriptions.unSubscribeCompanyToSubscription(companyId, subscriptionId); }
    subscribeUserToSubscription(userId: string, subscriptionId: string) { return this.restSubscriptions.subscribeUserToSubscription(userId, subscriptionId); }
    unSubscribeUserToSubscription(userId: string, subscriptionId: string) { return this.restSubscriptions.unSubscribeUserToSubscription(userId, subscriptionId); }
    getAUserProfiles(userId: string) { return this.restSubscriptions.getAUserProfiles(userId); }
    getAUserProfilesFeaturesByUserId(userId: string) { return this.restSubscriptions.getAUserProfilesFeaturesByUserId(userId); }
    //endregion Offers and subscriptions

    //region Bubbles Tags

    retrieveAllBubblesByTags(tags, format="small", nbUsersToKeep=100) { return this.restBubblesTags.retrieveAllBubblesByTags(tags, format, nbUsersToKeep); }
    setTagsOnABubble(roomId, tags) { return this.restBubblesTags.setTagsOnABubble(roomId, tags); }
    deleteTagOnABubble(roomIds, tag) { return this.restBubblesTags.deleteTagOnABubble(roomIds, tag); }

    //endregion Bubbles Tags

    //region Bubbles - dialIn

    disableDialInForARoom(roomId) { return this.restBubblesDialIn.disableDialInForARoom(roomId); }
    enableDialInForARoom(roomId) { return this.restBubblesDialIn.enableDialInForARoom(roomId); }
    resetDialInCodeForARoom(roomId) { return this.restBubblesDialIn.resetDialInCodeForARoom(roomId); }
    getDialInPhoneNumbersList(shortList) { return this.restBubblesDialIn.getDialInPhoneNumbersList(shortList); }

    //endregion Bubbles - dialIn

    //region Alerts - Notifications — proxies → RESTAlerts

    createDevice(data: Object) { return this.restAlerts.createDevice(data); }
    updateDevice(deviceId, params: Object) { return this.restAlerts.updateDevice(deviceId, params); }
    deleteDevice(deviceId: string) { return this.restAlerts.deleteDevice(deviceId); }
    getDevice(deviceId: string) { return this.restAlerts.getDevice(deviceId); }
    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number, limit: number) { return this.restAlerts.getDevices(companyId, userId, deviceName, type, tag, offset, limit); }
    getDevicesTags(companyId: string) { return this.restAlerts.getDevicesTags(companyId); }
    renameDevicesTags(newTagName: string, tag: string, companyId: string) { return this.restAlerts.renameDevicesTags(newTagName, tag, companyId); }
    deleteDevicesTags(tag: string, companyId: string) { return this.restAlerts.deleteDevicesTags(tag, companyId); }
    getstatsTags(companyId: string) { return this.restAlerts.getstatsTags(companyId); }
    createTemplate(data: Object) { return this.restAlerts.createTemplate(data); }
    updateTemplate(templateId, params: Object) { return this.restAlerts.updateTemplate(templateId, params); }
    deleteTemplate(templateId: string) { return this.restAlerts.deleteTemplate(templateId); }
    getTemplate(templateId: string) { return this.restAlerts.getTemplate(templateId); }
    getTemplates(companyId: string, offset: number, limit: number) { return this.restAlerts.getTemplates(companyId, offset, limit); }
    createFilter(data: Object) { return this.restAlerts.createFilter(data); }
    updateFilter(FilterId, params: Object) { return this.restAlerts.updateFilter(FilterId, params); }
    deleteFilter(FilterId: string) { return this.restAlerts.deleteFilter(FilterId); }
    getFilter(templateId: string) { return this.restAlerts.getFilter(templateId); }
    getFilters(offset: number, limit: number) { return this.restAlerts.getFilters(offset, limit); }
    createAlert(data: Object) { return this.restAlerts.createAlert(data); }
    updateAlert(AlertId, params: Object) { return this.restAlerts.updateAlert(AlertId, params); }
    deleteAlert(AlertId: string) { return this.restAlerts.deleteAlert(AlertId); }
    getAlert(alertId: string) { return this.restAlerts.getAlert(alertId); }
    getAlerts(offset: number, limit: number) { return this.restAlerts.getAlerts(offset, limit); }
    sendAlertFeedback(alertId: string, data: Object) { return this.restAlerts.sendAlertFeedback(alertId, data); }
    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string) { return this.restAlerts.getAlertFeedbackSentForANotificationMessage(notificationHistoryId); }
    getAlertFeedbackSentForAnAlert(alertId: string) { return this.restAlerts.getAlertFeedbackSentForAnAlert(alertId); }
    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string) { return this.restAlerts.getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId); }
    getReportSummary(alertId: string) { return this.restAlerts.getReportSummary(alertId); }
    getReportDetails(alertId: string) { return this.restAlerts.getReportDetails(alertId); }
    getReportComplete(alertId: string) { return this.restAlerts.getReportComplete(alertId); }

    //endregion Alerts - Notifications

    //region calendar
    getCalendarState() { return this.restCalendar.getCalendarState(); }
    getCalendarStates(users: Array<string> = [undefined]) { return this.restCalendar.getCalendarStates(users); }
    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string) { return this.restCalendar.setCalendarRegister(type, redirect, callbackUrl); }
    getCalendarAutomaticReplyStatus(userid?: string) { return this.restCalendar.getCalendarAutomaticReplyStatus(userid); }
    enableOrNotCalendar(disable: boolean) { return this.restCalendar.enableOrNotCalendar(disable); }
    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string) { return this.restCalendar.controlCalendarOrIgnoreAnEntry(disable, ignore); }
    unregisterCalendar() { return this.restCalendar.unregisterCalendar(); }
    //endregion

    //region MSTeams
    controlMsteamsPresence(disable?: boolean, ignore?: string) { return this.restCalendar.controlMsteamsPresence(disable, ignore); }
    getMsteamsPresenceState(userId: string) { return this.restCalendar.getMsteamsPresenceState(userId); }
    getMsteamsPresenceStates(users: Array<string> = []) { return this.restCalendar.getMsteamsPresenceStates(users); }
    registerMsteamsPresenceSharing(redirect?: boolean, callback?: string) { return this.restCalendar.registerMsteamsPresenceSharing(redirect, callback); }
    unregisterMsteamsPresenceSharing() { return this.restCalendar.unregisterMsteamsPresenceSharing(); }
    activateMsteamsPresence() { return this.restCalendar.activateMsteamsPresence(); }
    deactivateMsteamsPresence() { return this.restCalendar.deactivateMsteamsPresence(); }
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

    getInformationOnImports(companyId?: string, ldapConfigId?: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetImports
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
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
    synchronizeUsersAndDeviceswithCSV(CSVTxt?: string, companyId?: string, label: string = undefined, noemails: boolean = true, nostrict: boolean = false, delimiter?: string, comment: string = "%", commandId?: string, ldapConfigId?: string): Promise<{
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
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "label", label);
        addParamToUrl(urlParamsTab, "noemails", String(noemails));
        addParamToUrl(urlParamsTab, "nostrict", String(nostrict));
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        addParamToUrl(urlParamsTab, "commandId", commandId);
        addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
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
    retrieveRainbowUserList(companyId?: string, format: string = "csv", ldap_id: boolean = true, ldapConfigId?: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronize";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", String(ldap_id));
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
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

    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string, ldapConfigId?: string) {
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
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
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

    ActivateALdapConnectorUser(companyId : string = null): Promise<{ id: string, companyId: string, loginEmail: string, password: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/activate

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/activate";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
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

    sendCommandToLdapConnectorUser(ldapId: string, command: string, ldapConfigId: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-connectors-CommandLdap
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId/command

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId + "/command";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
            url = urlParamsTab[0];

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

    retrieveLdapConnectorConfig(companyId: string, p_type?: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfig
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "type", p_type);
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

    retrieveLdapConnectorAllConfigs(companyId: string, supportMultiDomain: boolean = false) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapConfigs
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/configs 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/configs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "supportMultiDomain", supportMultiDomain);
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

    createListOfEventsForConnector(events) { return this.restConnectors.createListOfEventsForConnector(events); }

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
    createAClientVersion(id: string, version: string) { return this.restClientsVersions.createAClientVersion(id, version); }
    deleteAClientVersion(clientId: string) { return this.restClientsVersions.deleteAClientVersion(clientId); }
    getAClientVersionData(clientId: string) { return this.restClientsVersions.getAClientVersionData(clientId); }
    getAllClientsVersions(name?: string, typeClient?: string, limit: number = 100, offset?: number, sortField: string = "name", sortOrder: number = 1) { return this.restClientsVersions.getAllClientsVersions(name, typeClient, limit, offset, sortField, sortOrder); }
    updateAClientVersion(clientId: string, version: string) { return this.restClientsVersions.updateAClientVersion(clientId, version); }
    //endregion Clients Versions

    //region sites
    createASite(name: string, status: string, companyId: string) { return this.restSites.createASite(name, status, companyId); }
    deleteSite(siteId: string) { return this.restSites.deleteSite(siteId); }
    getSiteData(siteId: string) { return this.restSites.getSiteData(siteId); }
    getAllSites(format = "small", limit = 100, offset = 0, sortField = "name", sortOrder: number, name: string, companyId: string) { return this.restSites.getAllSites(format, limit, offset, sortField, sortOrder, name, companyId); }
    updateSite(siteId: string, name: string, status: string, companyId: string) { return this.restSites.updateSite(siteId, name, status, companyId); }
    //endregion sites

    //region systems
    createSystem(name: string, pbxId: string = undefined, pbxLdapId: string = undefined, siteId: string, type: string, country: string, version ?: string, serverPingTimeout ?: number, pbxMainBundlePrefix ?: Array<string>, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, activationCode ?: string, isCentrex ?: boolean, isShared ?: boolean, bpId ?: string, isOxoManaged ?: boolean) { return this.restSystems.createSystem(name, pbxId, pbxLdapId, siteId, type, country, version, serverPingTimeout, pbxMainBundlePrefix, usePbxMainBundlePrefix, pbxNumberingTranslator, pbxNationalPrefix, pbxInternationalPrefix, searchResultOrder, activationCode, isCentrex, isShared, bpId, isOxoManaged); }
    deleteSystem(systemId: string) { return this.restSystems.deleteSystem(systemId); }
    getSystemConnectionState(systemId: string, format: string = "small", connectionHistory?: boolean) { return this.restSystems.getSystemConnectionState(systemId, format, connectionHistory); }
    getSystemDataByPbxId(pbxId: string, connectionHistory?: boolean) { return this.restSystems.getSystemDataByPbxId(pbxId, connectionHistory); }
    getSystemData(systemId: string, connectionHistory?: boolean) { return this.restSystems.getSystemData(systemId, connectionHistory); }
    getAllSystems(connectionHistory ?: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "pbxId", sortOrder: number = 1, name ?: string, type ?: string, status ?: string, siteId ?: string, companyId ?: string, bpId ?: string, isShared ?: boolean, isCentrex ?: boolean, isSharedOrCentrex ?: boolean, isOxoManaged ?: boolean, fromCreationDate ?: string, toCreationDate ?: string) { return this.restSystems.getAllSystems(connectionHistory, format, limit, offset, sortField, sortOrder, name, type, status, siteId, companyId, bpId, isShared, isCentrex, isSharedOrCentrex, isOxoManaged, fromCreationDate, toCreationDate); }
    getListOfCountriesAllowedForSystems() { return this.restSystems.getListOfCountriesAllowedForSystems(); }
    updateSystem(systemId: string, name ?: string, siteId ?: string, pbxLdapId ?: string, type ?: string, country ?: string, version ?: string, serverPingTimeout: number = 100, pbxMainBundlePrefix ?: string, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, isShared ?: boolean, bpId ?: string) { return this.restSystems.updateSystem(systemId, name, siteId, pbxLdapId, type, country, version, serverPingTimeout, pbxMainBundlePrefix, usePbxMainBundlePrefix, pbxNumberingTranslator, pbxNationalPrefix, pbxInternationalPrefix, searchResultOrder, isShared, bpId); }
    getASystemPhoneNumber(systemId: string, phoneNumberId: string) { return this.restSystems.getASystemPhoneNumber(systemId, phoneNumberId); }
    getAllSystemPhoneNumbers(systemId: string, shortNumber?: string, internalNumber ?: string, pbxUserId ?: string, companyPrefix?: string, isMonitored ?: boolean, name ?: string, deviceName ?: string, isAssignedToUser ?: boolean, format: string = "small", limit: number = 100, offset ?: number, sortField: string = "shortNumber", sortOrder: number = 1) { return this.restSystems.getAllSystemPhoneNumbers(systemId, shortNumber, internalNumber, pbxUserId, companyPrefix, isMonitored, name, deviceName, isAssignedToUser, format, limit, offset, sortField, sortOrder); }
    updateASystemPhoneNumber(systemId: string, phoneNumberId: string, isMonitored ?: boolean, userId ?: string, internalNumber ?: string, number ?: string, type ?: string, deviceType ?: string, firstName ?: string, lastName ?: string, deviceName ?: string, isVisibleByOthers ?: boolean) { return this.restSystems.updateASystemPhoneNumber(systemId, phoneNumberId, isMonitored, userId, internalNumber, number, type, deviceType, firstName, lastName, deviceName, isVisibleByOthers); }
    getPbxData(pbxId: string) { return this.restSystems.getPbxData(pbxId); }
    getAllPbxs(format: string = "small", sortField: string = "id", limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, type: string = undefined, status: string = undefined, siteId: string = undefined, companyId: string = undefined, bpId: string = undefined, isShared: boolean = undefined, isCentrex: boolean = undefined, isSharedOrCentrex: boolean = undefined, isOxoManaged: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined) { return this.restSystems.getAllPbxs(format, sortField, limit, offset, sortOrder, name, type, status, siteId, companyId, bpId, isShared, isCentrex, isSharedOrCentrex, isOxoManaged, fromCreationDate, toCreationDate); }
    createPbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) { return this.restSystems.createPbxPhoneNumber(pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, internalNumber, type, deviceType, firstName, lastName, deviceName); }
    deletePbxPhoneNumber(pbxId: string, shortNumber: string) { return this.restSystems.deletePbxPhoneNumber(pbxId, shortNumber); }
    getPbxPhoneNumber(pbxId: string, shortNumber: string) { return this.restSystems.getPbxPhoneNumber(pbxId, shortNumber); }
    getAllPbxPhoneNumbers(pbxId: string, format: string = "small", shortNumber: string, internalNumber: string, pbxUserId: string, companyPrefix: string, isMonitored: boolean, name: string, nameOrShortNumber: string, deviceName: string, isAssignedToUser: boolean, limit: number = 100, offset: number, sortField: string = "shortNumber", sortOrder: number = 1) { return this.restSystems.getAllPbxPhoneNumbers(pbxId, format, shortNumber, internalNumber, pbxUserId, companyPrefix, isMonitored, name, nameOrShortNumber, deviceName, isAssignedToUser, limit, offset, sortField, sortOrder); }
    updatepbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, companyName: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) { return this.restSystems.updatepbxPhoneNumber(pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, companyName, internalNumber, type, deviceType, firstName, lastName, deviceName); }
    //endregion systems
    //endregion systems

    //region Rainbow Company Directory portal 
    createDirectoryEntry(companyId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string) { return this.restDirectory.createDirectoryEntry(companyId, firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2); }
    deleteCompanyDirectoryAllEntry(companyId: string) { return this.restDirectory.deleteCompanyDirectoryAllEntry(companyId); }
    deleteDirectoryEntry(entryId: string) { return this.restDirectory.deleteDirectoryEntry(entryId); }
    getDirectoryEntryData(entryId: string, format: string) { return this.restDirectory.getDirectoryEntryData(entryId, format); }
    getListDirectoryEntriesData(companyId: string, organisationIds: string, name: string, search: string, type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date, toUpdateDate: Date, tags: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number, view: string) { return this.restDirectory.getListDirectoryEntriesData(companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view); }
    updateDirectoryEntry(entryId: string, firstName: string, lastName: string, companyName: string, department: string, street: string, city: string, state: string, postalCode: string, country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[], otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[], custom1: string, custom2: string) { return this.restDirectory.updateDirectoryEntry(entryId, firstName, lastName, companyName, department, street, city, state, postalCode, country, workPhoneNumbers, mobilePhoneNumbers, otherPhoneNumbers, jobTitle, eMail, tags, custom1, custom2); }
    ImportDirectoryCsvFile(companyId, csvContent, label) { return this.restDirectory.ImportDirectoryCsvFile(companyId, csvContent, label); }
    getAllTagsAssignedToDirectoryEntries(companyId: string) { return this.restDirectory.getAllTagsAssignedToDirectoryEntries(companyId); }
    removeTagFromAllDirectoryEntries(companyId: string, tag: string) { return this.restDirectory.removeTagFromAllDirectoryEntries(companyId, tag); }
    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string) { return this.restDirectory.renameTagForAllAssignedDirectoryEntries(tag, companyId, newTagName); }
    getStatsRegardingTagsOfDirectoryEntries(companyId: string) { return this.restDirectory.getStatsRegardingTagsOfDirectoryEntries(companyId); }
    //endregion Rainbow Company Directory portal

    //region Rainbow Bubbles Polls — proxies → RESTPolls

    createBubblePoll(roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean = false, duration: number = 0) { return this.restPolls.createBubblePoll(roomId, title, questions, anonymous, duration); }
    deleteBubblePoll(pollId) { return this.restPolls.deleteBubblePoll(pollId); }
    getBubblePoll(pollId: string, format: string = "small") { return this.restPolls.getBubblePoll(pollId, format); }
    getBubblePollsByBubble(roomId: string, format: string = "small", limit: number = 100, offset: number) { return this.restPolls.getBubblePollsByBubble(roomId, format, limit, offset); }
    publishBubblePoll(pollId: string) { return this.restPolls.publishBubblePoll(pollId); }
    terminateBubblePoll(pollId: string) { return this.restPolls.terminateBubblePoll(pollId); }
    unpublishBubblePoll(pollId: string) { return this.restPolls.unpublishBubblePoll(pollId); }
    updateBubblePoll(pollId: string, roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean, duration: number) { return this.restPolls.updateBubblePoll(pollId, roomId, title, questions, anonymous, duration); }
    votesForBubblePoll(pollId: string, votes: Array<{ question: number, answers: Array<number> }>) { return this.restPolls.votesForBubblePoll(pollId, votes); }

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

    //region Room

    getRoomsAsAdmin(params?: any) { let that = this; return that.restRoom.getRoomsAsAdmin(params); }
    createRoomAsAdmin(body: any) { let that = this; return that.restRoom.createRoomAsAdmin(body); }
    getRoomByIdAsAdmin(roomId: string, nbUsersToKeep?: number) { let that = this; return that.restRoom.getRoomByIdAsAdmin(roomId, nbUsersToKeep); }
    updateRoomAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.updateRoomAsAdmin(roomId, body); }
    deleteRoomAsAdmin(roomId: string) { let that = this; return that.restRoom.deleteRoomAsAdmin(roomId); }
    rehostRoomAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.rehostRoomAsAdmin(roomId, body); }
    uploadRoomAvatarAsAdmin(roomId: string, binaryData: { data: any; type: string }) { let that = this; return that.restRoom.uploadRoomAvatarAsAdmin(roomId, binaryData); }
    deleteRoomAvatarAsAdmin(roomId: string) { let that = this; return that.restRoom.deleteRoomAvatarAsAdmin(roomId); }
    promoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.promoteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    demoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.demoteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    deleteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any) { let that = this; return that.restRoom.deleteSomeOrAllRoomUsersAsAdmin(roomId, body); }
    getMyPushToTalk(params?: any) { let that = this; return that.restRoom.getMyPushToTalk(params); }
    clearRoomContent(roomId: string, body: any) { let that = this; return that.restRoom.clearRoomContent(roomId, body); }
    getApiRainbowPing() { let that = this; return that.restRoom.getApiRainbowPing(); }
    getApiRainbowRoomV10About() { let that = this; return that.restRoom.getApiRainbowRoomV10About(); }
    getMetricsRoom() { let that = this; return that.restRoom.getMetrics(); }
    deleteMetricsRoom() { let that = this; return that.restRoom.deleteMetrics(); }
    putApiRainbowLogsLevels(body: { console?: string; file?: string; syslog?: string }) { let that = this; return that.restRoom.putApiRainbowLogsLevels(body); }

    //endregion Room

    //region Customer Care
    getCustomerCareAdministratorsGroup() { return this.restCustomerCare.getCustomerCareAdministratorsGroup(); }
    addAdministratorToGroup(userId?: string) { return this.restCustomerCare.addAdministratorToGroup(userId || this.userId); }
    removeAdministratorFromGroup(userId?: string) { return this.restCustomerCare.removeAdministratorFromGroup(userId || this.userId); }
    getIssue(logId: string) { return this.restCustomerCare.getIssue(logId); }
    getListOfIssues(limit: number = 100, offset: number = 0, sortField: string = "creationDate", sortOrder: number = -1, companyId: string, bpId: string, customerCategory: string = "all", name: string, version: string, device: string, fromCreationDate: string, toCreationDate: string, fromOccurrenceDate: string, toOccurrenceDate: string, format: string = "small") { return this.restCustomerCare.getListOfIssues(limit, offset, sortField, sortOrder, companyId, bpId, customerCategory, name, version, device, fromCreationDate, toCreationDate, fromOccurrenceDate, toOccurrenceDate, format); }
    getListOfIssuesForUser(userId?: string, format: string = "small") { return this.restCustomerCare.getListOfIssuesForUser(userId || this.userId, format); }
    getIssueForUser(userId?: string, logId: string = undefined) { return this.restCustomerCare.getIssueForUser(userId || this.userId, logId); }
    initiateLogsContext(userId?: string, occurrenceDate: string = undefined, occurrenceDateTimezone: string = undefined, type: string = undefined, description: string = undefined, resourceId: string = undefined, externalRef: string = undefined, device: string = undefined, attachments: Array<string> = undefined, version: string = undefined, deviceDetails: any = undefined) { return this.restCustomerCare.initiateLogsContext(userId || this.userId, occurrenceDate, occurrenceDateTimezone, type, description, resourceId, externalRef, device, attachments, version, deviceDetails); }
    completeLogsContext(userId?: string, logId: string = undefined, occurrenceDate: string = undefined, occurrenceDateTimezone: string = undefined, description: string = undefined, externalRef: string = undefined, device: string = undefined, attachments: Array<string> = undefined, version: string = undefined, deviceDetails: any = undefined) { return this.restCustomerCare.completeLogsContext(userId || this.userId, logId, occurrenceDate, occurrenceDateTimezone, description, externalRef, device, attachments, version, deviceDetails); }
    cancelOrCloseLogsSubmission(userId?: string, logId: string = undefined) { return this.restCustomerCare.cancelOrCloseLogsSubmission(userId || this.userId, logId); }
    acknowledgeLogsRequest(userId?: string, logId: string = undefined) { return this.restCustomerCare.acknowledgeLogsRequest(userId || this.userId, logId); }
    rejectLogsRequest(userId?: string, logId: string = undefined) { return this.restCustomerCare.rejectLogsRequest(userId || this.userId, logId); }
    adminOrBotAddAdditionalFiles(userId?: string, logId: string = undefined, attachments: Array<string> = undefined, conversationId: string = undefined, fileName: string = undefined) { return this.restCustomerCare.adminOrBotAddAdditionalFiles(userId || this.userId, logId, attachments, conversationId, fileName); }
    getListOfResourcesForUser(userId?: string) { return this.restCustomerCare.getListOfResourcesForUser(userId || this.userId); }
    createAnAtriumTicket(userId?: string, subject: string = undefined, description: string = undefined, additionalDescription: string = undefined, resource: string = undefined, externalRef: string = undefined, logs: Array<string> = undefined) { return this.restCustomerCare.createAnAtriumTicket(userId || this.userId, subject, description, additionalDescription, resource, externalRef, logs); }
    updateAnAtriumTicket(userId?: string, ticketId: string = undefined, subject: string = undefined, description: string = undefined, additionalDescription: string = undefined, resource: string = undefined, externalRef: string = undefined, logs: Array<string> = undefined) { return this.restCustomerCare.updateAnAtriumTicket(userId || this.userId, ticketId, subject, description, additionalDescription, resource, externalRef, logs); }
    deleteAnAtriumTicketInformation(userId?: string, ticketId: string = undefined) { return this.restCustomerCare.deleteAnAtriumTicketInformation(userId || this.userId, ticketId); }
    readAnAtriumTicketInformation(userId?: string, ticketId: string = undefined) { return this.restCustomerCare.readAnAtriumTicketInformation(userId || this.userId, ticketId); }
    readAllTicketsOnASameCompany(userId?: string) { return this.restCustomerCare.readAllTicketsOnASameCompany(userId || this.userId); }
    //endregion Customer Care

    //region Tasks MANAGEMENT — proxies → RESTTasks

    async addTask(task: any) { return this.restTasks.addTask(this.userId, task); }
    getAllCategories() { return this.restTasks.getAllCategories(this.userId); }
    createTaskcategory(category: string) { return this.restTasks.createTaskcategory(this.userId, category); }
    createOrUpdatePropertiesTaskByCategoryId(categoryId: string, properties: any) { return this.restTasks.createOrUpdatePropertiesTaskByCategoryId(this.userId, categoryId, properties); }
    async getTaskById(taskId: string) { return this.restTasks.getTaskById(this.userId, taskId); }
    getTasksByCategoryId(category: string) { return this.restTasks.getTasksByCategoryId(this.userId, category); }
    getTasks(category: string) { return this.restTasks.getTasks(this.userId, category); }
    deletePropertiesFromCategoriesTasks(categoryId: string) { return this.restTasks.deletePropertiesFromCategoriesTasks(this.userId, categoryId); }
    deleteTask(taskId: string) { return this.restTasks.deleteTask(this.userId, taskId); }
    deleteCategoryFromTasks(categoryId: string) { return this.restTasks.deleteCategoryFromTasks(this.userId, categoryId); }
    updateTask(taskId: string, task: TaskInput) { return this.restTasks.updateTask(this.userId, taskId, task); }

    //endregion Tasks MANAGEMENT

        //endregion Rainbow Voice Routing

    //region Rainbow APIs Settings

    getApisSettings() { return this.restApiSettings.getApisSettings(); }

    //endregion Rainbow APIs Settings

    //region Presence Synchronize CPE Exchange Calendar [AD/LDAP]
    // RQRAINB-12269 VBR
    notifyCalendarProvider(ids: Array<string>, headers: any = {}, forceNotify: boolean = undefined) { return this.restCalendar.notifyCalendarProvider(ids, headers, forceNotify, this.userId, this._options?.httpOptions, this.account?.companyId); }
    //endregion Presence Synchronize CPE Exchange Calendar [AD/LDAP]
}

export {RESTService, MEDIATYPE, GuestParams};
module.exports.RESTService = RESTService;
module.exports.MEDIATYPE = MEDIATYPE;
module.exports.GuestParams = GuestParams;
