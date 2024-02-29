"use strict";
import {addDaysToDate, isDefined} from "../Utils";

export {};


const MD5 = require("md5");
import {config} from "../../config/config";
//const config = require("../../config/config");

/*************************************************************/
/* STATIC ENUM                                               */
/*************************************************************/
/**
 * Type of Admin.
 * @public
 * @enum {string}
 * @readonly
 */
const AdminType = {
    /** Organization administrator */
    'ORGANIZATION_ADMIN': "organization_admin",
    /** Company administrator */
    'COMPANY_ADMIN': "company_admin",
    /** Site administrator */
    'SITE_ADMIN': "site_admin",
    /** No administrator right */
    'UNDEFINED': "undefined"
};

/**
 * NameUpdatePrio
 * @public
 * @enum {number}
 * @readonly
 */
const NameUpdatePrio = {
    /** no update prio then could be updated */
    'NO_UPDATE_PRIO': 0,
    /** prio associated to outlook name resolution update */
    'OUTLOOK_UPDATE_PRIO': 1,
    /** prio associated to server name resolution (phonebook or office365AD ...) update */
    'SERVER_UPDATE_PRIO': 2,
    /** max prio : no update could overwrite */
    'MAX_UPDATE_PRIO': 99
};

const textAvatarColor = ["#ff4500", "#d38700", "#348833", "#007356", "#00b2a9", "#00b0e5", "#0085ca", "#6639b7", "#91278a", "#cf0072", "#a50034", "#d20000"];


/**
 * @class
 * @name Contact
 * @public
 * @description
 *      This class is used to represent a contact or the connected user <br>
 *      A contact is defined by a set of public information (name, firstName, avatar...) and a set of private information that are only shared with contacts that are in the user's network or in the same company (email, phone numbers...)
 */
class Contact {
	public id: any;
	public _displayName: any;
	public name: any;
	public displayNameMD5: any;
	public companyName: any;
	public loginEmail: any;
	public nickName: any;
	public title: any;
	public jobTitle: any;
	public country: any;
	public timezone: any;
	public organisationId: any;
	public siteId: any;
	public companyId: any;
	public jid_im: any;
	public jid: any;
	public jid_tel: any;
	public jidtel: any;
	public avatar: any;
	public lastAvatarUpdateDate: any;
	public lastUpdateDate: any;
	public adminType: any;
	public roles: any;
	public phoneNumbers: any;
	public phonePro: any;
	public phoneProCan: any;
	public phonePbx: any;
	public phoneInternalNumber: any;
	public pbxId: any;
	public mobilePro: any;
	public mobileProCan: any;
	public phonePerso: any;
	public phonePersoCan: any;
	public mobilePerso: any;
	public mobilePersoCan: any;
	public voicemailNumber: any;
	public emails: any;
	public emailPro: any;
	public emailPerso: any;
	public lastName: any;
	public firstName: any;
	public isTerminated: any;
	public language: any;
	public presence: string;
	public status: any;
	public resources: any;
	public nameUpdatePrio: any;
	public initials: any;
	public nickname: any;
	public roster: any;
	public initialized: any;
	public colorIndex: any;
	public color: any;
	public _id: any;
	//public isBot: any;
	public isInDefaultCompany: any;
	public company: any;
	public hasPhoneNumber: any;
	public guestMode: any;
    public openInviteId: any;
    public userInfo1: null;
    public userInfo2: null;
    public ask: string;
    public subscription: string;
    public temp: boolean;
    public invitation: any;
    public selectedTheme: string;
    public customData: any;
    public isVirtualTerm: boolean;
    public tags: Array<string>;
    private _lastContactCacheUpdate: Date;
    public isActive : boolean;
    public  accountType : string;
    public  systemId : string;
    public  isInitialized : boolean;
    public  initializationDate : string;
    public  createdBySelfRegister : boolean;
    public  createdByAdmin : any;
    public  createdByAppId : string;
    public  firstLoginDate : string;
    public  lastLoginDate : string;
    public  loggedSince: string;
    public  failedLoginAttempts : number;
    public  lastLoginFailureDate : string;
    public  lastExpiredTokenRenewedDate : string;
    public  lastPasswordUpdateDate : string;
    public  timeToLive : number;
    public  timeToLiveDate : string;
    public  terminatedDate : string;
    public  fileSharingCustomisation : string;
    public  userTitleNameCustomisation : string;
    public  softphoneOnlyCustomisation : string;
    public  useRoomCustomisation : string;
    public  phoneMeetingCustomisation : string;
    public  useChannelCustomisation : string;
    public  useScreenSharingCustomisation : string;
    public  useWebRTCAudioCustomisation : string;
    public  useWebRTCVideoCustomisation : string;
    public  instantMessagesCustomisation : string;
    public  userProfileCustomisation : string;
    public  fileStorageCustomisation : string;
    public  overridePresenceCustomisation : string;
    public  changeTelephonyCustomisation : string;
    public  changeSettingsCustomisation : string;
    public  recordingConversationCustomisation : string;
    public  useGifCustomisation : string;
    public  useDialOutCustomisation : string;
    public  fileCopyCustomisation : string;
    public  fileTransferCustomisation : string;
    public  forbidFileOwnerChangeCustomisation : string;
    public  readReceiptsCustomisation : string;
    public  useSpeakingTimeStatistics : string;
    public  selectedAppCustomisationTemplate : any;
    public  alertNotificationReception : string;
    public  selectedDeviceFirmware : string;
    public  visibility : string;
    public  jid_password : string;
    public  creationDate : string;
    public  profiles : Array<any>;
    public  activationDate : string;
    public  lastOfflineMailReceivedDate : string;
    public  state : string;
    public  authenticationType : string;
    public  department : string;
    public  isADSearchAvailable : boolean;
    public  isTv : boolean;
    public  calendars : Array<any>;
    public  openInvites : any;
    public isAlertNotificationEnabled : boolean;
    
    public outOfOffice : any;
    public lastSeenDate : string;
    public eLearningCustomisation : boolean;
    public eLearningGamificationCustomisation : boolean;
    public useRoomAsRBVoiceUser : boolean;
    public useWebRTCAudioAsRBVoiceUser : boolean;
    public msTeamsPresence : any;

    public useWebRTCOnlyIfMobileLoggedCustomisation : boolean;
    public meetingRecordingCustomisation : boolean;
    public useOtherPhoneMode : boolean;
    public useComputerMode : boolean;
    public useSoftPhoneMode : boolean;
    public imPopupDuration : number;
    public canAccessWhatsNew : boolean;
    public canAccessFaqCustomisation : boolean;
    public canAccessHelpCenterCustomisation : boolean;
    public canAccessStoreCustomisation : boolean;
    public canDownloadAppCustomisation : boolean;
    public canCallParticipantPbxNumberCustomisation : string;
    public useExternalStorage : boolean;
    public useRainbowStorage : boolean;
    public mainStorage : string;
    public nextRosterAutoCleanup : string;
    public mfaRainbowAuth : any;

    constructor() {

        this._lastContactCacheUpdate = new Date();

        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Contact
         * @instance
         */
        this.id = "";

        /**
         * @private
         * @readonly
         */
        this._displayName = "";

        /**
         * @public
         * @property {Object} name The display name of the contact
         * @readonly
         */
        this.name = {value: this._displayName};

        this.displayNameMD5 = "";

        /**
         * @public
         * @readonly
         * @property {string} companyName The company name of the Contact
         * @instance
         */
        this.companyName = "";
        this.company = null;

        /**
         * @public
         * @readonly
         * @property {string} loginEmail The login email of the Contact
         * @instance
         * @description
         *  This field will soon become unavailable if the user is not allowed to view it, to follow the GPRD law.
         */
        this.loginEmail = "";

        /**
         * @public
         * @readonly
         * @property {string} nickName The nickname of the Contact
         * @instance
         */
        this.nickName = "";

        /**
         * @public
         * @readonly
         * @property {string} title The title of the Contact
         * @instance
         */
        this.title = "";

        /**
         * @public
         * @readonly
         * @property {string} jobTitle The job title of the Contact
         * @instance
         */
        this.jobTitle = "";

        /**
         * @public
         * @readonly
         * @property {string} country The country of the Contact
         * @instance
         */
        this.country = "";

        /**
         * @public
         * @readonly
         * @property {string} timezone The timezone of the Contact
         * @instance
         */
        this.timezone = "Europe/Paris";

        /**
         * @public
         * @readonly
         * @property {string} organisationId The organisation ID of the Contact
         * @instance
         */
        this.organisationId = "";

        /**
         * @public
         * @readonly
         * @property {string} siteId The site ID of the Contact
         * @instance
         */
        this.siteId = "";

        /**
         * @public
         * @readonly
         * @property {string} companyId The company ID of the Contact
         * @instance
         */
        this.companyId = "";

        /**
         * @public
         * @readonly
         * @property {string} jid_im The JID of the Contact
         * @instance
         */
        this.jid_im = "";

        /**
         * @public
         * @readonly
         * @property {string} jid The JID of the Contact (same as jid_im, for compatibility)
         * @instance
         */
        this.jid = "";

        /**
         * @public
         * @readonly
         * @property {string} jid_tel The JID_TEL of the Contact
         * @instance
         */
        this.jid_tel = "";

        /**
         * @public
         * @readonly
         * @property {string} jidtel The JID_TEL of the Contact (same as jidtel, for compatibility)
         * @instance
         */
        this.jidtel = "";

        /**
         * @public
         * @readonly
         * @property {string} avatar The Contact avatar, if an avatar exist will return an Url, either a local file.
         * @instance
         */
        this.avatar = "";

        /**
         * @public
         * @readonly
         * @property {string} lastAvatarUpdateDate The date of the last avatar update
         * @instance
         */
        this.lastAvatarUpdateDate = null;

        /**
         * @public
         * @readonly
         * @property {string} lastUpdateDate The date of the last time information about the contact changed
         * @instance
         */
        this.lastUpdateDate = "Z";

        /**
         * @public
         * @readonly
         * @property {string} adminType The type of admin role. Can be `organization_admin`, `company_admin`, `site_admin`
         * @instance
         */
        this.adminType = "undefined";

        /**
         * @public
         * @readonly
         * @property  {string[]} roles (For the connected user only). The associated roles of the connected user. Can be `guest`, `user`, `admin`
         * @instance
         * @description
         *  This field will soon become unavailable if the user is not allowed to view it, to follow the GPRD law.
         */
        this.roles = ["user"];

        /**
         * @public
         * @readonly
         * @property {Object[]} phoneNumbers The list of phone numbers associated to the Contact
         * @instance
         */
        this.phoneNumbers = [];

        /**
         * @public
         * @property {string} phonePro The professional phone number of the contact
         * @readonly
         */
        this.phonePro = "";

        /**
         * @public
         * @property {string} phoneProCan The professional phone number of the contact (canonical format)
         * @readonly
         */
        this.phoneProCan = "";

        /**
         * @public
         * @property {string} phonePbx The phone number if exists associated to the user and monitored by Rainbow
         * @readonly
         */
        this.phonePbx = "";

        /**
         * @public
         * @property {string} phoneInternalNumber The internal number if exists associated to the user and monitored by Rainbow
         * @readonly
         */
        this.phoneInternalNumber = "";

        /**
         * @public
         * @property {string} pbxId The ID of the PBX monitored by Rainbow where the user's phone is associated
         * @readonly
         */
        this.pbxId = "";

        /**
         * @public
         * @property {string} mobilePro The professional mobile phone of the contact
         * @readonly
         */
        this.mobilePro = "";

        /**
         * @public
         * @property {string} mobileProCan The professional mobile phone of the contact (canonical format)
         * @readonly
         */
        this.mobileProCan = "";

        /**
         * @public
         * @property {string} phonePerso The personal phone of the contact
         * @readonly
         */
        this.phonePerso = "";

        /**
         * @public
         * @property {string} phonePersoCan The personal phone of the contact (canonical format)
         * @readonly
         */
        this.phonePersoCan = "";

        /**
         * @public
         * @property {string} mobilePerso The personal mobile phone of the contact
         * @readonly
         */
        this.mobilePerso = "";

        /**
         * @public
         * @property {string} mobilePersoCan The personal mobile phone of the contact (canonical format)
         * @readonly
         */
        this.mobilePersoCan = "";

        /**
         * @public
         * @readonly
         * @property {String} voicemailNumber The number of the voicemail associated to the Contact
         * @instance
         */
        this.voicemailNumber = "";

        /**
         * @public
         * @readonly
         * @property {Object[]} emails The list of email addresses associated to the Contact
         * @instance
         */
        this.emails = [];

        /**
         * @public
         * @property {string} emailPro The professional email of the contact
         * @readonly
         */
        this.emailPro = "";

        /**
         * @public
         * @property {string} emailPerso The personal email of the contact
         * @readonly
         */
        this.emailPerso = "";

        /**
         * @public
         * @readonly
         * @property {string} lastName The lastname of the Contact
         * @instance
         */
        this.lastName = "";

        /**
         * @public
         * @readonly
         * @property {string} firstName The firstname of the Contact
         * @instance
         */
        this.firstName = "";

        /**
         * @public
         * @readonly
         * @property {Boolean} isTerminated True if the Contact has been removed
         * @instance
         */
        this.isTerminated = false;

        /**
         * @public
         * @readonly
         * @property {string} language The language of the Contact
         * @instance
         */
        this.language = "en";

        /**
         * @public
         * @readonly
         * @property {string} presence The presence of the contact. Can be `offline`, `busy`, `away`, `online`, `unknown`
         * @instance
         */
        this.presence = "";

        /**
         * @public
         * @readonly
         * @property {string} status An additional status information for the presence. Can be `phone`, `presentation`, `mobile` or ``
         * @instance
         */
        this.status = "";

        /**
         * @public
         * @readonly
         * @property {Object} resources The list of resources of the Contact
         * @instance
         */
        this.resources = {};

        /**
         * @public
         * @property {number} nameUpdatePrio Prio of the service having made an update
         * @readonly
         */
        this.nameUpdatePrio = NameUpdatePrio.MAX_UPDATE_PRIO;//default Max prio

        /**
         * @public
         * @property {string} initials The initials of the contact
         * @readonly
         */
        this.initials = "";

        /**
         * @public
         * @property {string} nickname The nickname of the contact
         * @readonly
         */
        this.nickname = "";

        /**
         * @public
         * @property {boolean} roster True if the contact is part of the favorized contact's list of the connected user
         * @readonly
         */
        this.roster = false;

        /**
         * @private
         * @readonly
         */
        this.initialized = false;

        /**
         * @public
         * @property {boolean} guestMode Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.
         * @readonly
         */
        this.guestMode = false;

        /**
         * @public
         * @property {string} id The open invite ID of the user
         * @readonly
         */
        this.openInviteId = null;

        /**
         * @public
         * @property {string} ask (Contact Only) The subscription progress
         * @readonly
         */
        this.ask = "none";

        /**
         * @public
         * @property {string} subscription (Contact only) The subscription state for this contact (none or both)
         * @readonly
         */
        this.subscription = "none";

        // Status
        /**
         * @public
         * @readonly
         */
        this.temp = false;

        /**
         * @public
         * @property {string} userInfo1 Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
         * @readonly
         */
        this.userInfo1 = null;
        
        /**
         * @public
         * @property {string} userInfo2 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
         * @readonly
         */
        this.userInfo2 = null;


        /**
         * @public
         * @property {Object} customData User's custom data. Object with free keys/values. </BR>
         * It is up to the client to manage the user's customData (new customData provided overwrite the existing one). </BR>
         * Restrictions on customData Object: </BR>
         * * max 20 keys, </BR>
         * * max key length: 64 characters, </BR>
         * * max value length: 4096 characters.
         * @readonly
         */
        this.customData = [];

        /**
         * @public
         * @property {string} selectedTheme Theme to be used by the user. </BR>
         * If the user is allowed to (company has 'allowUserSelectTheme' set to true), he can choose his preferred theme among the list of supported themes (see https://openrainbow.com/api/rainbow/enduser/v1.0/themes).
         * @readonly
         */
        this.selectedTheme = null;


        /**
         * @public
         * @property {Array<string>} tags An Array of free tags associated to the user. </BR>
         * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. </BR>
         * tags can only be set by users who have administrator rights on the user. The user can't modify the tags. </BR>
         * The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags.
         * @readonly
         */
        this.tags = [];

        /**
         * @public
         * @property {boolean} isActive Is user active
         * @readonly
         */
        this.isActive = false;

        /**
         * @public
         * @property {string} accountType 
         * @readonly
         */
        this.accountType = null;

        /**
         * @public
         * @property {string} systemId If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. [Only for phone numbers linked to a system (pbx)]
         * @readonly
         */
        this.systemId = null;

        /**
         * @public
         * @property {boolean} isInitialized Is user initialized
         * @readonly
         */
        this.isInitialized = false;

        /**
         * @public
         * @property {string} initializationDate User initialization date
         * @readonly
         */
        this.initializationDate = null;

        /**
         * @public
         * @property {boolean} createdBySelfRegister true if user has been created using self register
         * @readonly
         */
        this.createdBySelfRegister = false;

        /**
         * @public
         * @property {Object} createdByAdmin If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user
         * @readonly
         */
        this.createdByAdmin  = null;

        /**
         * @private
         * @property {string} createdByAppId
         * @readonly
         */
        this.createdByAppId = null;

        /**
         * @public
         * @property {string} firstLoginDate Date of first user login (only set the first time user logs in, null if user never logged in)
         * @readonly
         */
        this.firstLoginDate = null;

        /**
         * @public
         * @property {string} lastLoginDate Date of last user login (defined even if user is logged out)
         * @readonly
         */
        this.lastLoginDate = null;

        /**
         * @public
         * @property {string} loggedSince Date of last user login (null if user is logged out)
         * @readonly
         */
        this.loggedSince = null;

        /**
         * @private
         * @property {number} failedLoginAttempts
         * @readonly
         */
        this.failedLoginAttempts = 0;

        /**
         * @private
         * @property {string} lastLoginFailureDate
         * @readonly
         */
        this.lastLoginFailureDate = null;

        /**
         * @private
         * @property {string} lastExpiredTokenRenewedDate
         * @readonly
         */
        this.lastExpiredTokenRenewedDate = null;

        /**
         * @private
         * @property {string} lastPasswordUpdateDate
         * @readonly
         */
        this.lastPasswordUpdateDate = null;

        /**
         * @public
         * @property {number} timeToLive Duration in second to wait before automatically starting a user deletion from the creation date.</BR>
         * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment.</BR>
         * Value -1 means timeToLive is disable (i.e. user account will not expire).
         * @readonly
         */
        this.timeToLive = -1;

        /**
         * @private
         * @property {string} timeToLiveDate
         * @readonly
         */
        this.timeToLiveDate = null;

        /**
         * @private
         * @property {string} terminatedDate
         * @readonly
         */
        this.terminatedDate = null;

        /**
         * @public
         * @property {string} fileSharingCustomisation Activate/Deactivate file sharing capability per user </BR>
         * Define if the user can use the file sharing service then, allowed to download and share file. </BR>
         * FileSharingCustomisation can be: </BR>
         * </BR>
         *  * same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. </BR>
         *  * enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. </BR>
         *  * disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. </BR>
         *  
         * @readonly
         */
        this.fileSharingCustomisation = null;

        /**
         * @public
         * @property {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName)</BR>
         * Define if the user can change some profile data.</BR>
         * userTitleNameCustomisation can be:</BR>
         * * same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting.</BR>
         * * enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data.</BR>
         * * disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data.</BR>
         * @readonly
         */
        this.userTitleNameCustomisation = null;

        /**
         * @public
         * @property {string} softphoneOnlyCustomisation Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services</BR>
         * Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on.</BR>
         * softphoneOnlyCustomisation can be:</BR>
         * * same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting.</BR>
         * * enabled: The user switch to a softphone mode only.</BR>
         * * disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on.</BR>
         * @readonly
         */
        this.softphoneOnlyCustomisation = null;

        /**
         * @public
         * @property {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.</BR>
         * Define if a user can create bubbles or participate in bubbles (chat and web conference).</BR>
         * useRoomCustomisation can be:</BR>
         * * same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting.</BR>
         * * enabled: The user can use bubbles.</BR>
         * * disabled: The user can't use bubbles.</BR>
         * @readonly
         */
        this.useRoomCustomisation = null;

        /**
         * @public
         * @property {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).</BR>
         * Define if a user has the right to join phone meetings.</BR>
         * phoneMeetingCustomisation can be:</BR>
         * * same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting.</BR>
         * * enabled: The user can join phone meetings.</BR>
         * * disabled: The user can't join phone meetings.</BR>
         * @readonly
         */
        this.phoneMeetingCustomisation = null;

        /**
         * @public
         * @property {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.</BR>
         * Define if a user has the right to create channels or be a member of channels.</BR>
         * useChannelCustomisation can be:</BR>
         * * same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting.</BR>
         * * enabled: The user can use some channels.</BR>
         * * disabled: The user can't use some channel.</BR>
         * @readonly
         */
        this.useChannelCustomisation = null;

        /**
         * @public
         * @property {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.</BR>
         * Define if a user has the right to share his screen.</BR>
         * useScreenSharingCustomisation can be:</BR>
         * * same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting.</BR>
         * * enabled: Each user of the company can share his screen.</BR>
         * * disabled: No user of the company can share his screen.</BR>
         * @readonly
         */
        this.useScreenSharingCustomisation = null;

        /**
         * @public
         * @property {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.</BR>
         * Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).</BR>
         * useWebRTCAudioCustomisation can be:</BR>
         * * same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting.</BR>
         * * enabled: The user can switch to a Web RTC audio conversation.</BR>
         * * disabled: The user can't switch to a Web RTC audio conversation.</BR>
         * @readonly
         */
        this.useWebRTCAudioCustomisation = null;

        /**
         * @public
         * @property {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.</BR>
         * Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).</BR>
         * useWebRTCVideoCustomisation can be:</BR>
         * * same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting.</BR>
         * * enabled: The user can switch to a Web RTC video conversation.</BR>
         * * disabled: The user can't switch to a Web RTC video conversation.</BR>
         * @readonly
         */
        this.useWebRTCVideoCustomisation = null;

        /**
         * @public
         * @property {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.</BR>
         * Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.</BR>
         * instantMessagesCustomisation can be:</BR>
         * * same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting.</BR>
         * * enabled: The user can use instant messages.</BR>
         * * disabled: The user can't use instant messages.</BR>
         * @readonly
         */
        this.instantMessagesCustomisation = null;

        /**
         * @public
         * @property {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.</BR>
         * Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName).</BR>
         * userProfileCustomisation can be:</BR>
         * * same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting.</BR>
         * * enabled: The user can modify his profile.</BR>
         * * disabled: The user can't modify his profile.</BR>
         * @readonly
         */
        this.userProfileCustomisation = null;

        /**
         * @public
         * @property {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.</BR>
         * Define if a user has the right to upload/download/copy or share documents.</BR>
         * fileStorageCustomisation can be:</BR>
         * * same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting.</BR>
         * * enabled: The user can manage and share files.</BR>
         * * disabled: The user can't manage and share files.</BR>
         * @readonly
         */
        this.fileStorageCustomisation = null;

        /**
         * @public
         * @property {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to use instant messages.</BR>
         * Define if a user has the right to change his presence manually or only use automatic states.</BR>
         * overridePresenceCustomisation can be:</BR>
         * * same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting.</BR>
         * * enabled: The user can change his presence.</BR>
         * * disabled: The user can't change his presence.</BR>
         * @readonly
         */
        this.overridePresenceCustomisation = null;

        /**
         * @public
         * @property {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.</BR>
         * Define if a user has the right to modify some telephony settigs like forward activation...</BR>
         * changeTelephonyCustomisation can be:</BR>
         * * same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting.</BR>
         * * enabled: The user can modify telephony settings.</BR>
         * * disabled: The user can't modify telephony settings.</BR>
         * @readonly
         */
        this.changeTelephonyCustomisation = null;

        /**
         * @public
         * @property {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.</BR>
         * changeSettingsCustomisation can be:</BR>
         * * same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting.</BR>
         * * enabled: The user can change all client general settings.</BR>
         * * disabled: The user can't change any client general setting.</BR>
         * @readonly
         */
        this.changeSettingsCustomisation = null;

        /**
         * @public
         * @property {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.</BR>
         * Define if a user has the right to record a conversation (for P2P and multi-party calls).</BR>
         * recordingConversationCustomisation can be:</BR>
         * * same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting.</BR>
         * * enabled: The user can record a peer to peer or a multi-party call.</BR>
         * * disabled: The user can't record a peer to peer or a multi-party call.</BR>
         * @readonly
         */
        this.recordingConversationCustomisation = null;

        /**
         * @public
         * @property {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.</BR>
         * Define if a user has the is allowed to send animated GIFs in conversations</BR>
         * useGifCustomisation can be:</BR>
         * * same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting.</BR>
         * * enabled: The user can send animated GIFs in conversations.</BR>
         * * disabled: The user can't send animated GIFs in conversations.</BR>
         * @readonly
         */
        this.useGifCustomisation = null;

        /**
         * @public
         * @property {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.</BR>
         * Define if a user is allowed to be called by the Rainbow conference bridge.</BR>
         * useDialOutCustomisation can be:</BR>
         * * same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting.</BR>
         * * enabled: The user can be called by the Rainbow conference bridge.</BR>
         * * disabled: The user can't be called by the Rainbow conference bridge.</BR>
         * @readonly
         */
        this.useDialOutCustomisation = null;

        /**
         * @public
         * @property {string} fileCopyCustomisation Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space</BR>
         * fileCopyCustomisation can be:</BR>
         * * same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting.</BR>
         * * enabled: The user can make a copy of a file to his personal cloud space.</BR>
         * * disabled: The user can't make a copy of a file to his personal cloud space.</BR>
         * @readonly
         */
        this.fileCopyCustomisation = null;

        /**
         * @public
         * @property {string} fileTransferCustomisation Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation.</BR>
         * The file cannot be re-shared.</BR>
         * fileTransferCustomisation can be:</BR>
         * * same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting.</BR>
         * * enabled: The user can transfer a file doesn't belong to him.</BR>
         * * disabled: The user can't transfer a file doesn't belong to him.</BR>
         * @readonly
         */
        this.fileTransferCustomisation = null;

        /**
         * @public
         * @property {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the capability for a user to loose the ownership on one file.</BR>
         * One user can drop the ownership to another Rainbow user of the same company.</BR>
         * forbidFileOwnerChangeCustomisation can be:</BR>
         * * same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting.</BR>
         * * enabled: The user can't give the ownership of his file.</BR>
         * * disabled: The user can give the ownership of his file.</BR>
         * @readonly
         */
        this.forbidFileOwnerChangeCustomisation = null;

        /**
         * @public
         * @property {string} readReceiptsCustomisation Activate/Deactivate the capability for a user to allow a sender to check if a chat message is read.</BR>
         * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.</BR>
         * This right is used by Ucaas or Cpaas application to show either or not a message is acknowledged. No check is done on backend side.</BR>
         * readReceiptsCustomisation can be:</BR>
         * * same_than_company: The same readReceiptsCustomisation setting than the user's company's is applied to the user. if the readReceiptsCustomisation of the company is changed the user's readReceiptsCustomisation will use this company new setting.</BR>
         * * enabled: The user allows the sender to check if an IM is read.</BR>
         * * disabled: The user doesn't allow the sender to check if an IM is read.</BR>
         * @readonly
         */
        this.readReceiptsCustomisation = null;

        /**
         * @public
         * @property {string} useSpeakingTimeStatistics Activate/Deactivate the capability for a user to see speaking time statistics.</BR>
         * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.</BR>
         * useSpeakingTimeStatistics can be:</BR>
         * * same_than_company: The same useSpeakingTimeStatistics setting than the user's company's is applied to the user. if the useSpeakingTimeStatistics of the company is changed the user's useSpeakingTimeStatistics will use this company new setting.</BR>
         * * enabled: The user can use meeting speaking time statistics.</BR>
         * * disabled: The user can't use meeting speaking time statistics.</BR>
         * @readonly
         */
        this.useSpeakingTimeStatistics = null;

        /**
         * @public
         * @property {string} selectedAppCustomisationTemplate To log the last template applied to the user.
         * @readonly
         */
        this.selectedAppCustomisationTemplate = null;

        /**
         * @public
         * @property {string} alertNotificationReception Activate/Deactivate the capability for a user to receive alert notification.</BR>
         * Define if a user has the right to receive alert notification</BR>
         * alertNotificationReception can be:</BR>
         * enabled: Each user of the company can receive alert notification.</BR>
         * disabled: No user of the company can receive alert notification.</BR>
         * @readonly
         */
        this.alertNotificationReception = null;

        /**
         * @private
         * @property {string} selectedDeviceFirmware
         * @readonly
         */
        this.selectedDeviceFirmware = null;

        /**
         * @public
         * @property {string} visibility Company visibility (define if users being in this company can be searched by users being in other companies and if the user can search users being in other companies).</BR>
         * </BR>
         * * public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users</BR>
         * * private: User can't be searched by external users (even within his organisation) / can search external users. User can invite external users / can be invited by external users</BR>
         * * organisation: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users</BR>
         * * closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users</BR>
         * * isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users</BR>
         * * none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users</BR>
         * </BR>
         * External users mean public user not being in user's company nor user's organisation nor a company visible by user's company.</BR>
         * </BR>
         * Note related to organisation visibility:</BR>
         * </BR>
         * * Under the same organisation, a company can choose the visibility=organisation. That means users belonging to this company are visible for users of foreign companies inside the same organisation.</BR>
         * * The visibility=organisation is same as visibility=private outside the organisation. That is to say users can't be searched outside the organisation's companies.</BR>
         * </BR>
         * Default value : private. Possible values : public, private, organisation, closed, isolated</BR>
         * @readonly
         */
        this.visibility = null;

        /**
         * @public
         * @property {string} jid_password User Jabber IM and TEL password
         * @readonly
         */
        this.jid_password = null;

        /**
         * @public
         * @property {string} creationDate Date when the theme has been created.
         * @readonly
         */
        this.creationDate = null;

        /**
         * @public
         * @property {Array<Object>} profiles User profile Objects. 
         * @readonly
         */
        this.profiles = [];

        /**
         * @public
         * @property {string} activationDate User activation date
         * @readonly
         */
        this.activationDate = null;

        /**
         * @public
         * @property {string} lastOfflineMailReceivedDate The last time the user has received a message to connect to Rainbow from the logged in user 
         * @readonly
         */
        this.lastOfflineMailReceivedDate = null;

        /**
         * @public
         * @property {string} state When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null).
         * @readonly
         */
        this.state = null;

        /**
         * @public
         * @property {string} authenticationType User authentication type (if not set company default authentication will be used). Possible values : DEFAULT, RAINBOW, SAML, OIDC
         * @readonly
         */
        this.authenticationType = null;

        /**
         * @public
         * @property {string} department User department
         * @readonly
         */
        this.department = null;

        /**
         * @public
         * @property {boolean} isADSearchAvailable Is ActiveDirectory (Office365) search available for this user 
         * @readonly
         */
        this.isADSearchAvailable = false;

        /**
         * @public
         * @property {boolean} isTv Indicates if the user corresponds to a TV or not
         * @readonly
         */
        this.isTv = false;

        /**
         * @public
         * @property {Array<Object>} calendars List of associated calendars from external providers configured by the user (office365, google calendar, ...) </BR>
         * Only returned if the requested user is the logged in user. 
         * @readonly
         */
        this.calendars = null;

        /**
         * @private
         * @property {string} openInvites 
         * @readonly
         */
        this.openInvites = null;

        /**
         * @public
         * @property {boolean} isAlertNotificationEnabled Is user subscribed to Rainbow Alert Offer
         * @readonly
         */
        this.isAlertNotificationEnabled = false;


        /**
         * @public
         * @property {Object} outOfOffice Out of office user's informations. 
         * @readonly
         */
        this.outOfOffice = null;

        /**
         * @public
         * @property {string} lastSeenDate Approximate date when the user has been seen on Rainbow (null if user never logged in) </BR>
         * This date is updated: </BR>
         * When the user logs in (either from login API, SAML/OIDC SSO, OAuth) </BR>
         * When the token of the user is refreshed. </BR>
         * When the user logs out </BR>
         * @readonly
         */
        this.lastSeenDate = null;

        /**
         * @public
         * @property {boolean} eLearningCustomisation Activate/Deactivate the capability for a user to participate on a Elearning training. </BR>
         * Defines if a user can particapate on an Elearning training. </BR>
         * eLearningCustomisation can be: </BR>
         * * true: The user can participate on an Elearning training. </BR>
         * * false: The user can't participate on an Elearning training. </BR>
         * @readonly
         */
        this.eLearningCustomisation = null;

        /**
         * @public
         * @property {string} eLearningGamificationCustomisation Activate/Deactivate the capability for a user to earn badges for Elearning progress. </BR>
         * Defines if a user can earn badges for Elearning progress. </BR>
         * eLearningGamificationCustomisation can be: </BR>
         * * true: The user can earn badges for Elearning progress. </BR>
         * * false: The user can't earn badges for Elearning progress. </BR>
         * @readonly
         */
        this.eLearningGamificationCustomisation = null;

        /**
         * @public
         * @property {boolean} useRoomAsRBVoiceUser Technical flag for Rainbow voice users. Whatever the customisation template applied for the user, if he has a Rainbow Voice licence useRoomAsRBVoiceUser is enabled else it is disabled.
         * @readonly
         */
        this.useRoomAsRBVoiceUser = null;

        /**
         * @public
         * @property {boolean} useWebRTCAudioAsRBVoiceUser Technical flag for Rainbow voice users. Whatever the customisation template applied for the user, if he has a Rainbow Voice licence useWebRTCAudioAsRBVoiceUser is enabled else it is disabled.
         * @readonly
         */
        this.useWebRTCAudioAsRBVoiceUser = null;

        /**
         * @public
         * @property {Object} msTeamsPresence List of associated Microsoft Teams Presence configured by the user. 
         * @readonly
         */
        this.msTeamsPresence = null;

        /**
         * @public
         * @property {boolean} useWebRTCOnlyIfMobileLoggedCustomisation Activate/Deactivate the capability for a user to receive web RTC call if mobile app is signed in. </BR>
         * Define if a user has the right to be joined via audio (WebRTC) if he has a mobile application signed in. </BR>
         * can be: </BR>
         *     * true: The user of the company can receive a web RTC call if mobile app is signed in. </BR>
         *     * false: The user can't receive a web RTC call if mobile app is signed in. </BR>
         * @readonly
         */
        this.useWebRTCOnlyIfMobileLoggedCustomisation = null;

        /**
         * @public
         * @property {boolean} meetingRecordingCustomisation Activate/Deactivate the capability for a user to record a meeting. </BR>
         * Defines if a user can record a meeting. </BR>
         * can be: </BR>
         *     * true: The user can record a meeting. </BR>
         *     * false: The user can't record a meeting. </BR>
         * @readonly
         */
        this.meetingRecordingCustomisation = null;

        /**
         * @public
         * @property {boolean} useOtherPhoneMode Activate/Deactivate the capability for a user to use the other phone mode. </BR>
         * Defines if a user can use the other phone mode. </BR>
         * can be: </BR>
         *     * true: The user can use the other phone mode. </BR>
         *     * false: The user can't use the other phone mode. </BR>
         * @readonly
         */
        this.useOtherPhoneMode = null;

        /**
         * @public
         * @property {boolean} useComputerMode Activate/Deactivate the capability for a user to use the computer mode. </BR>
         * Defines if a user can use the computer mode. </BR>
         * can be: </BR>
         *     * true: The user can use the computer mode. </BR>
         *     * false: The user can't use the computer mode. </BR>
         * @readonly
         */
        this.useComputerMode = null;

        /**
         * @public
         * @property {boolean} useSoftPhoneMode Activate/Deactivate the capability for a user to use the softphone mode. </BR>
         * Defines if a user can use the softphone mode. </BR>
         * can be: </BR>
         *     * true: The user can use the softphone mode. </BR>
         *     * false: The user can't use the softphone mode. </BR>
         * @readonly
         */
        this.useSoftPhoneMode = null;

        /**
         * @public
         * @property {boolean} imPopupDurationDefines the IM popup duration. </BR>
         *     * If the imPopupDuration is not defined or null, the same imPopupDuration setting than the user's company's is applied to the user. </BR>
         *     * Otherwise, a new imPopupDuration is set for the user. </BR>
         * @readonly
         */
        this.imPopupDuration = null;

        /**
         * @public
         * @property {boolean} canAccessWhatsNew Activate/Deactivate the capability for a user to access to what's new. </BR>
         * Defines if a user can access to what's new. </BR>
         * can be: </BR>
         *     * true: The user can access to what's new. </BR>
         *     * false: The user can't access to what's new. </BR>
         * @readonly
         */
        this.canAccessWhatsNew = null;

        /**
         * @public
         * @property {boolean} canAccessFaqCustomisation Activate/Deactivate the capability for a user to access to the FAQ. </BR>
         * Defines if a user can access to the FAQ. </BR>
         * can be: </BR>
         *     * true: The user can access to the FAQ. </BR>
         *     * false: The user can't access to the FAQ. </BR>
         * @readonly
         */
        this.canAccessFaqCustomisation = null;

        /**
         * @public
         * @property {boolean} canAccessHelpCenterCustomisation Activate/Deactivate the capability for a user to access to Rainbow help center. </BR>
         * Defines if a user can access to Rainbow help center. </BR>
         * can be: </BR>
         *     * true: The user can access to Rainbow help center. </BR>
         *     * false: The user can't access to Rainbow help center. </BR>
         * @readonly
         */
        this.canAccessHelpCenterCustomisation = null;

        /**
         * @public
         * @property {boolean} canAccessStoreCustomisation Activate/Deactivate the capability for a user to access to Rainbow store. </BR>
         * Defines if a user can access to Rainbow store. </BR>
         * can be: </BR>
         *     * true: The user can access to Rainbow store. </BR>
         *     * false: The user can't access to Rainbow store. </BR>
         * @readonly
         */
        this.canAccessStoreCustomisation = null;

        /**
         * @public
         * @property {boolean} canDownloadAppCustomisation Activate/Deactivate the capability for a user to download Rainbow application. </BR>
         * Defines if a user can download Rainbow application. </BR>
         * can be: </BR>
         *     * true: The user can download Rainbow application. </BR>
         *     * false: The user can't download Rainbow application. </BR>
         * @readonly
         */
        this.canDownloadAppCustomisation = null;

        /**
         * @public
         * @property {string} canCallParticipantPbxNumberCustomisation Select the capability for a user to call participant via a PBX number. </BR>
         * Defines if a user can call participant via a PBX number. </BR>
         * can be: </BR>
         *     * enabled: The user can call participant with all number. </BR>
         *     * disabled: The user can't call participant. </BR>
         *     * internal: The user can call participant only with internal number. </BR>
         *     * national: The user can call participant with national number. </BR>
         * @readonly
         */
        this.canCallParticipantPbxNumberCustomisation = null;

        /**
         * @public
         * @property {boolean} useExternalStorage In an environment where a company uses the Rainbow file server and an External file server at the same time, 'useExternalStorage' allows a user to be assigned to a file server. </BR>
         *     * true: Assign all users to the External File Storage. </BR>
         *     * false: Unassign all users from the External File Storage. </BR>
         * @readonly
         */
        this.useExternalStorage = null;

        /**
         * @public
         * @property {boolean} useRainbowStorage In an environment where a company uses the Rainbow file server and an External file server at the same time, 'useRainbowStorage' allows a user to be assigned to a file server. </BR>
         *     * true: Assign all users to the default Rainbow File Storage. </BR>
         *     * false: Unassign all users from the default Rainbow File Storage. </BR>
         * @readonly
         */
        this.useRainbowStorage = null;

        /**
         * @public
         * @property {string} mainStorage an environment where a company uses the Rainbow file server and an External file server at the same time, 'mainStorage' allows to decide which file server must be used when a user is assigned to both file servers. </BR>
         *     * Rainbow Storage: Assigment to the Rainbow file server. </BR>
         *     * External Storage: Assigment to the External file server. </BR>
         * @readonly
         */
        this.mainStorage = null;

        this.nextRosterAutoCleanup = null;
        this.mfaRainbowAuth={};
    }

    updateLastContactCacheUpdate() {
        this._lastContactCacheUpdate = new Date();
    }

    isObsoleteCache() {
        //this._lastContactCacheUpdate = new Date("2021-03-23T18:30:05.754Z");
        if (this.roster) return false; 
        let dayPlusOne = addDaysToDate(this._lastContactCacheUpdate,1) ;
        return (  dayPlusOne <  new Date() ) ; 
    }
    
    /**
     * @public
     * @readonly
     * @property {string} displayName The display name of the Contact
     * @instance
     */

    set displayName(value) {
        this._displayName = value;
        this.name.value = value;
        this.displayNameMD5 = MD5(value);
    }

    get displayName () {
        return this._displayName;
    }

    setNameUpdatePrio (prio) {
        switch (prio) {
            case NameUpdatePrio.NO_UPDATE_PRIO:
            case NameUpdatePrio.OUTLOOK_UPDATE_PRIO:
            case NameUpdatePrio.SERVER_UPDATE_PRIO:
            case NameUpdatePrio.MAX_UPDATE_PRIO:
                this.nameUpdatePrio = prio ;
                break;
            default://no change
        }
    }

    getNameUpdatePrio () {
        return this.nameUpdatePrio;
    }

    displayNameForLog () {
        /*if (config && config.debug) {
            return this.displayName;
        } // */
        return this.displayNameMD5;
    }

    computeCompleteDisplayName (firstName, lastName) {
        let displayName = "";
        let initials = "";
        if (lastName.length !== 1 && firstName.length !== 2) {
            if (config.displayOrder === "firstLast") {
                displayName = firstName + " " + lastName;
                initials = firstName.charAt(0) + lastName.charAt(0);
            }
            else {
                displayName = lastName + " " + firstName;
                initials = lastName.charAt(0) + firstName.charAt(0);
            }
        }
        else {
            if (config.displayOrder === "firstLast") {
                displayName = firstName + " " + lastName;
            } else {
                displayName = lastName + " " + firstName;
            }

            initials = firstName.charAt(0) + firstName.charAt(1);
        }
        this.displayName = displayName;
        this.initials = initials;

        // Compute contact color
        let upperCaseDisplayName = this.displayName.toUpperCase();
        let sum = 0;

        for (let i = 0; i < upperCaseDisplayName.length; i++) {
            sum += upperCaseDisplayName.charCodeAt(i);
        }

        this.colorIndex = (sum % 12);
        this.color = textAvatarColor[this.colorIndex];
    }

    computeDisplayName () {
        let firstName = this.firstName ? (this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1)) : null;
        let lastName = this.lastName ? (this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1)) : null;
        let nickName = this.nickname ? (this.nickname.charAt(0).toUpperCase() + this.nickname.slice(1)) : null;
        if (lastName && firstName) {
            this.computeCompleteDisplayName(firstName, lastName);
        }
        else if (lastName && !firstName) {
            this.displayName = lastName;
            this.initials = lastName.charAt(0);
        }
        else if (nickName) {
            this.displayName = nickName;
            this.initials = nickName.charAt(0);
        }
        else {
            this.displayName = "Anonymous";
            this.initials = "A";
        }
    }

    updateName (firstName, lastName) {
        let that = this;
        // Identification fields
        that.firstName = firstName;
        that.lastName = lastName;
        // Compute display name
        that.computeDisplayName();
    }

    updateFromUserData (userData) {
        let that = this;

        // Identification fields
        that.id = userData.id;
        that.loginEmail = userData.loginEmail;
        that.firstName = userData.firstName;
        that.lastName = userData.lastName;
        that.nickname = userData.nickName ? userData.nickName : "";
        that.title = userData.title ? userData.title : "";
        that.jobTitle = userData.jobTitle ? userData.jobTitle : "";
        that.organisationId = userData.organisationId;
        that.companyId = userData.companyId;
        that.companyName = userData.companyName;
        that.siteId = userData.siteId;
        that.country = userData.country ? userData.country : "FRA";
        that.timezone = userData.timezone;
        that.roles = userData.roles;
        that.adminType = userData.adminType;
        //that.isBot = false;
        that.isTerminated = userData.isTerminated;
        that.isInDefaultCompany = userData.isInDefaultCompany;
        that.lastAvatarUpdateDate = userData.lastAvatarUpdateDate;
        that.initialized = userData.isInitialized;
        that.avatar = userData.avatar;
        that.guestMode = userData.guestMode ? userData.guestMode : false;
        that.openInviteId = userData.openInviteId ? userData.openInviteId : that.openInviteId;
        that.userInfo1 = that.userInfo1 ? that.userInfo1 : userData.userInfo1;
        that.userInfo2 = that.userInfo2 ? that.userInfo2 : userData.userInfo2;

        that.customData = userData.customData ? userData.customData : [];
        that.selectedTheme = userData.selectedTheme;


        // Handle jids
        if (userData.jid_im) {
            that._id = userData.jid_im;
            that.jid = userData.jid_im;
            that.jidtel = userData.jid_tel;
            that.jid_im = userData.jid_im;
            that.jid_tel = userData.jid_tel;
        }

        // Company field
        if (!that.company || that.company.id !== userData.companyId) {
            // this.company = Company.create(userData.companyId, userData.companyName);
        }

        // Telephony fields
        that.phonePro = that.phoneProCan = "";
        that.phonePbx = userData.phonePbx + "";
        that.phoneInternalNumber = "";//#29475
        that.pbxId = "";
        that.mobilePro = that.mobileProCan = "";
        that.phonePerso = that.phonePersoCan = "";
        that.mobilePerso = that.mobilePersoCan = "";
        that.voicemailNumber = "";
        that.hasPhoneNumber = false;

        that.roster = that.roster ? that.roster : false;
        that.presence = that.presence ? that.presence : "offline";
        that.status = that.status ? that.status : "";

        // Update emails
        if (userData.emails) {
            that.emails = userData.emails;
            that.emailPerso = "";
            userData.emails.forEach(function (email) {
                switch (email.type) {
                    case "work":
                        that.emailPro = email.email;
                        break;
                    case "home":
                        that.emailPerso = email.email;
                        break;
                    default:
                        break;
                }
            });
        }

        // Update phone numbers
        if (userData.phoneNumbers) {
            that.phoneNumbers = userData.phoneNumbers;
            that.phoneNumbers.forEach(function (phoneNumber) {
                let number = phoneNumber.number;
                let numberCan = phoneNumber.numberE164;
                let deviceType = phoneNumber.deviceType;
                that.hasPhoneNumber = true;
                switch (phoneNumber.type) {
                    case "work":
                        if (deviceType === "landline") {
                            that.phonePro = number;
                            that.phoneProCan = numberCan;
                            if (phoneNumber.isFromSystem) {
                                that.phonePbx = phoneNumber.shortNumber;
                                if (phoneNumber.internalNumber) { //#29475++
                                    that.phoneInternalNumber = phoneNumber.internalNumber;
                                } //#29475--
                                that.pbxId = phoneNumber.pbxId;
                                that.voicemailNumber = phoneNumber.voiceMailNumber;
                            }
                        }
                        if (deviceType === "mobile") {
                            that.mobilePro = number;
                            that.mobileProCan = numberCan;
                        }
                        break;
                    case "home":
                        if (deviceType === "landline") {
                            that.phonePerso = number;
                            that.phonePersoCan = numberCan;
                        }
                        if (deviceType === "mobile") {
                            that.mobilePerso = number;
                            that.mobilePersoCan = numberCan;
                        }
                        break;
                    default:
                        break;
                }
            });
        } else {
            that.phoneNumbers = [];
            that.phonePro = "";
            that.phoneProCan = "";
            that.phonePbx = "";
            that.phoneInternalNumber = "";
            that.pbxId = "";
            that.voicemailNumber = "";
            that.mobilePro = "";
            that.mobileProCan = "";
            that.phonePerso = "";
            that.phonePersoCan = "";
        }

        if (userData.tags) {
            that.tags = userData.tags
        }

        if (userData.isActive) {
            that.isActive = userData.isActive;
        }
        if (userData.accountType) {
            that.accountType = userData.accountType;
        }
        if (userData.systemId) {
            that.systemId = userData.systemId;
        }
        if (userData.isInitialized) {
            that.isInitialized = userData.isInitialized;
        }
        if (userData.initializationDate) {
            that.initializationDate = userData.initializationDate;
        }
        if (userData.createdBySelfRegister) {
            that.createdBySelfRegister = userData.createdBySelfRegister;
        }
        if (userData.createdByAppId) {
            that.createdByAppId = userData.createdByAppId;
        }
        if (userData.createdByAdmin) {
            that.createdByAdmin = userData.createdByAdmin;
        }
        if (userData.firstLoginDate) {
            that.firstLoginDate = userData.firstLoginDate;
        }
        if (userData.lastLoginDate) {
            that.lastLoginDate = userData.lastLoginDate;
        }
        if (userData.loggedSince) {
            that.loggedSince = userData.loggedSince;
        }
        if (userData.failedLoginAttempts) {
            that.failedLoginAttempts = userData.failedLoginAttempts;
        }
        if (userData.lastLoginFailureDate) {
            that.lastLoginFailureDate = userData.lastLoginFailureDate;
        }
        if (userData.lastExpiredTokenRenewedDate) {
            that.lastExpiredTokenRenewedDate = userData.lastExpiredTokenRenewedDate;
        }
        if (userData.lastPasswordUpdateDate) {
            that.lastPasswordUpdateDate = userData.lastPasswordUpdateDate;
        }
        if (userData.timeToLive) {
            that.timeToLive = userData.timeToLive;
        }
        if (userData.timeToLiveDate) {
            that.timeToLiveDate = userData.timeToLiveDate;
        }
        if (userData.terminatedDate) {
            that.terminatedDate = userData.terminatedDate;
        }
        if (userData.fileSharingCustomisation) {
            that.fileSharingCustomisation = userData.fileSharingCustomisation;
        }
        if (userData.userTitleNameCustomisation) {
            that.userTitleNameCustomisation = userData.userTitleNameCustomisation;
        }
        if (userData.softphoneOnlyCustomisation) {
            that.softphoneOnlyCustomisation = userData.softphoneOnlyCustomisation;
        }
        if (userData.useRoomCustomisation) {
            that.useRoomCustomisation = userData.useRoomCustomisation;
        }
        if (userData.phoneMeetingCustomisation) {
            that.phoneMeetingCustomisation = userData.phoneMeetingCustomisation;
        }
        if (userData.useChannelCustomisation) {
            that.useChannelCustomisation = userData.useChannelCustomisation;
        }
        if (userData.useScreenSharingCustomisation) {
            that.useScreenSharingCustomisation = userData.useScreenSharingCustomisation;
        }
        if (userData.useWebRTCAudioCustomisation) {
            that.useWebRTCAudioCustomisation = userData.useWebRTCAudioCustomisation;
        }
        if (userData.useWebRTCVideoCustomisation) {
            that.useWebRTCVideoCustomisation = userData.useWebRTCVideoCustomisation;
        }
        if (userData.instantMessagesCustomisation) {
            that.instantMessagesCustomisation = userData.instantMessagesCustomisation;
        }
        if (userData.userProfileCustomisation) {
            that.userProfileCustomisation = userData.userProfileCustomisation;
        }
        if (userData.fileStorageCustomisation) {
            that.fileStorageCustomisation = userData.fileStorageCustomisation;
        }
        if (userData.overridePresenceCustomisation) {
            that.overridePresenceCustomisation = userData.overridePresenceCustomisation;
        }
        if (userData.changeTelephonyCustomisation) {
            that.changeTelephonyCustomisation = userData.changeTelephonyCustomisation;
        }
        if (userData.changeSettingsCustomisation) {
            that.changeSettingsCustomisation = userData.changeSettingsCustomisation;
        }
        if (userData.recordingConversationCustomisation) {
            that.recordingConversationCustomisation = userData.recordingConversationCustomisation;
        }
        if (userData.useGifCustomisation) {
            that.useGifCustomisation = userData.useGifCustomisation;
        }
        if (userData.useDialOutCustomisation) {
            that.useDialOutCustomisation = userData.useDialOutCustomisation;
        }
        if (userData.fileCopyCustomisation) {
            that.fileCopyCustomisation = userData.fileCopyCustomisation;
        }
        if (userData.fileTransferCustomisation) {
            that.fileTransferCustomisation = userData.fileTransferCustomisation;
        }
        if (userData.forbidFileOwnerChangeCustomisation) {
            that.forbidFileOwnerChangeCustomisation = userData.forbidFileOwnerChangeCustomisation;
        }
        if (userData.readReceiptsCustomisation) {
            that.readReceiptsCustomisation = userData.readReceiptsCustomisation;
        }
        if (userData.useSpeakingTimeStatistics) {
            that.useSpeakingTimeStatistics = userData.useSpeakingTimeStatistics;
        }
        if (userData.selectedAppCustomisationTemplate) {
            that.selectedAppCustomisationTemplate  = userData.selectedAppCustomisationTemplate;
        }
        if (userData.alertNotificationReception) {
            that.alertNotificationReception = userData.alertNotificationReception;
        }
        if (userData.selectedDeviceFirmware) {
            that.selectedDeviceFirmware = userData.selectedDeviceFirmware;
        }
        if (userData.visibility) {
            that.visibility = userData.visibility;
        }
        if (userData.jid_password) {
            that.jid_password = userData.jid_password;
        }
        if (userData.creationDate) {
            that.creationDate = userData.creationDate;
        }
        if (userData.profiles) {
            that.profiles = userData.profiles;
        }
        if (userData.activationDate) {
            that.activationDate = userData.activationDate;
        }
        if (userData.lastOfflineMailReceivedDate) {
            that.lastOfflineMailReceivedDate = userData.lastOfflineMailReceivedDate;
        }
        if (userData.state) {
            that.state = userData.state;
        }
        if (userData.authenticationType) {
            that.authenticationType = userData.authenticationType;
        }
        if (userData.department) {
            that.department = userData.department;
        }
        if (userData.isADSearchAvailable) {
            that.isADSearchAvailable = userData.isADSearchAvailable;
        }
        if (userData.isTv) {
            this.isTv = userData.isTv;
        }        
        if (userData.calendars) {
            this.calendars = userData.calendars;
        }
        if (userData.openInvites) {
            this.openInvites = userData.openInvites;
        }
        if (userData.isAlertNotificationEnabled) {
            this.isAlertNotificationEnabled = userData.isAlertNotificationEnabled;
        }
        if (userData.outOfOffice) {
            this.outOfOffice = userData.outOfOffice;
        }
        if (userData.lastSeenDate) {
            this.lastSeenDate = userData.lastSeenDate;
        }
        if (userData.eLearningCustomisation === "enabled" || userData.eLearningCustomisation === "disabled") {
            this.eLearningCustomisation = userData.eLearningCustomisation==="enabled";
        }
        if (userData.eLearningGamificationCustomisation === "enabled" || userData.eLearningGamificationCustomisation === "disabled") {
            this.eLearningGamificationCustomisation = userData.eLearningGamificationCustomisation==="enabled";
        }
        if (userData.useRoomAsRBVoiceUser === "enabled" || userData.meetingRecordingCustomisation === "disabled") {
            this.useRoomAsRBVoiceUser = userData.useRoomAsRBVoiceUser==="enabled";
        }
        if (userData.useWebRTCAudioAsRBVoiceUser === "enabled" || userData.meetingRecordingCustomisation === "disabled") {
            this.useWebRTCAudioAsRBVoiceUser = userData.useWebRTCAudioAsRBVoiceUser==="enabled";
        }
        if (userData.msTeamsPresence) {
            this.msTeamsPresence = userData.msTeamsPresence;
        }
        if (userData.useWebRTCOnlyIfMobileLoggedCustomisation === "enabled" || userData.useWebRTCOnlyIfMobileLoggedCustomisation === "disabled") {
            this.useWebRTCOnlyIfMobileLoggedCustomisation = userData.useWebRTCOnlyIfMobileLoggedCustomisation==="enabled";
        }
        if (userData.meetingRecordingCustomisation === "enabled" || userData.meetingRecordingCustomisation === "disabled") {
            this.meetingRecordingCustomisation = userData.meetingRecordingCustomisation==="enabled";
        }
        if (userData.useOtherPhoneMode === "enabled" || userData.useOtherPhoneMode === "disabled") {
            this.useOtherPhoneMode = userData.useOtherPhoneMode==="enabled";
        }
        if (userData.useComputerMode === "enabled" || userData.useComputerMode === "disabled") {
            this.useComputerMode = userData.useComputerMode==="enabled";
        }
        if (userData.useSoftPhoneMode === "enabled" || userData.useSoftPhoneMode === "disabled") {
            this.useSoftPhoneMode = userData.useSoftPhoneMode==="enabled";
        }
        if (userData.canAccessWhatsNew === "enabled" || userData.canAccessWhatsNew === "disabled") {
            this.canAccessWhatsNew = userData.canAccessWhatsNew==="enabled";
        }
        if (userData.canAccessFaqCustomisation === "enabled" || userData.canAccessFaqCustomisation === "disabled") {
            this.canAccessFaqCustomisation = userData.canAccessFaqCustomisation==="enabled";
        }
        if (userData.canAccessHelpCenterCustomisation === "enabled" || userData.canAccessHelpCenterCustomisation === "disabled") {
            this.canAccessHelpCenterCustomisation = userData.canAccessHelpCenterCustomisation==="enabled";
        }
        if (userData.canAccessStoreCustomisation === "enabled" || userData.canAccessStoreCustomisation === "disabled") {
            this.canAccessStoreCustomisation = userData.canAccessStoreCustomisation==="enabled";
        }
        if (userData.canDownloadAppCustomisation === "enabled" || userData.canDownloadAppCustomisation === "disabled") {
            this.canDownloadAppCustomisation = userData.canDownloadAppCustomisation==="enabled";
        }
        this.canCallParticipantPbxNumberCustomisation = userData.canCallParticipantPbxNumberCustomisation;
        if (userData.useExternalStorage === "enabled" || userData.useExternalStorage === "disabled") {
            this.useExternalStorage = userData.useExternalStorage==="enabled";
        }
        if (userData.useRainbowStorage === "enabled" || userData.useRainbowStorage === "disabled") {
            this.useRainbowStorage = userData.useRainbowStorage==="enabled";
        }
        this.mainStorage = userData.mainStorage;

        if (isDefined(userData.nextRosterAutoCleanup) ) {
            this.nextRosterAutoCleanup = userData.nextRosterAutoCleanup;
        }
        if (userData.mfaRainbowAuth ) {
            this.mfaRainbowAuth = userData.mfaRainbowAuth;
        }

        // Compute display name
        that.computeDisplayName();

        // dev-code //
        that.checkPropertiesName(userData);
        // end-dev-code //

    }

    checkPropertiesName(obj : any){
        let objProperties = Object.getOwnPropertyNames(this);
        /* objProperties.forEach((prop) => {
            console.log("Contact obj propertie Name : ", prop);
        }); // */
        Object.getOwnPropertyNames(obj).forEach(
                (val, idx, array) => {
                    //console.log(val + " -> " + data[val]);
                    if (!objProperties.find((el) => {
                        return (val == el || val == "displayName");
                    })) {
                        // dev-code-console //
                        console.log("WARNING : One property of the parameter of obj method is not present in the Contact class : ", val, " -> ", obj[val]);
                        //console.log("WARNING : One property of the parameter of obj method is not present in the Contact class : ", val);
                        // end-dev-code-console //
                    }
                });
    }
    
    isGuest() {
        return this.guestMode;
    };
/*
    get id(): any {
        return this._id;
    }

    set id(value: any) {
        this._id = value;
    }

    get name(): any {
        return this._name;
    }

    set name(value: any) {
        this._name = value;
    }

    get displayNameMD5(): any {
        return this._displayNameMD5;
    }

    set displayNameMD5(value: any) {
        this._displayNameMD5 = value;
    }

    get companyName(): any {
        return this._companyName;
    }

    set companyName(value: any) {
        this._companyName = value;
    }

    get loginEmail(): any {
        return this._loginEmail;
    }

    set loginEmail(value: any) {
        this._loginEmail = value;
    }

    get nickName(): any {
        return this._nickName;
    }

    set nickName(value: any) {
        this._nickName = value;
    }

    get title(): any {
        return this._title;
    }

    set title(value: any) {
        this._title = value;
    }

    get jobTitle(): any {
        return this._jobTitle;
    }

    set jobTitle(value: any) {
        this._jobTitle = value;
    }

    get country(): any {
        return this._country;
    }

    set country(value: any) {
        this._country = value;
    }

    get timezone(): any {
        return this._timezone;
    }

    set timezone(value: any) {
        this._timezone = value;
    }

    get organisationId(): any {
        return this._organisationId;
    }

    set organisationId(value: any) {
        this._organisationId = value;
    }

    get siteId(): any {
        return this._siteId;
    }

    set siteId(value: any) {
        this._siteId = value;
    }

    get companyId(): any {
        return this._companyId;
    }

    set companyId(value: any) {
        this._companyId = value;
    }

    get jid_im(): any {
        return this._jid_im;
    }

    set jid_im(value: any) {
        this._jid_im = value;
    }

    get jid(): any {
        return this._jid;
    }

    set jid(value: any) {
        this._jid = value;
    }

    get jid_tel(): any {
        return this._jid_tel;
    }

    set jid_tel(value: any) {
        this._jid_tel = value;
    }

    get jidtel(): any {
        return this._jidtel;
    }

    set jidtel(value: any) {
        this._jidtel = value;
    }

    get avatar(): any {
        return this._avatar;
    }

    set avatar(value: any) {
        this._avatar = value;
    }

    get lastAvatarUpdateDate(): any {
        return this._lastAvatarUpdateDate;
    }

    set lastAvatarUpdateDate(value: any) {
        this._lastAvatarUpdateDate = value;
    }

    get lastUpdateDate(): any {
        return this._lastUpdateDate;
    }

    set lastUpdateDate(value: any) {
        this._lastUpdateDate = value;
    }

    get adminType(): any {
        return this._adminType;
    }

    set adminType(value: any) {
        this._adminType = value;
    }

    get roles(): any {
        return this._roles;
    }

    set roles(value: any) {
        this._roles = value;
    }

    get phoneNumbers(): any {
        return this._phoneNumbers;
    }

    set phoneNumbers(value: any) {
        this._phoneNumbers = value;
    }

    get phonePro(): any {
        return this._phonePro;
    }

    set phonePro(value: any) {
        this._phonePro = value;
    }

    get phoneProCan(): any {
        return this._phoneProCan;
    }

    set phoneProCan(value: any) {
        this._phoneProCan = value;
    }

    get phonePbx(): any {
        return this._phonePbx;
    }

    set phonePbx(value: any) {
        this._phonePbx = value;
    }

    get phoneInternalNumber(): any {
        return this._phoneInternalNumber;
    }

    set phoneInternalNumber(value: any) {
        this._phoneInternalNumber = value;
    }

    get pbxId(): any {
        return this._pbxId;
    }

    set pbxId(value: any) {
        this._pbxId = value;
    }

    get mobilePro(): any {
        return this._mobilePro;
    }

    set mobilePro(value: any) {
        this._mobilePro = value;
    }

    get mobileProCan(): any {
        return this._mobileProCan;
    }

    set mobileProCan(value: any) {
        this._mobileProCan = value;
    }

    get phonePerso(): any {
        return this._phonePerso;
    }

    set phonePerso(value: any) {
        this._phonePerso = value;
    }

    get phonePersoCan(): any {
        return this._phonePersoCan;
    }

    set phonePersoCan(value: any) {
        this._phonePersoCan = value;
    }

    get mobilePerso(): any {
        return this._mobilePerso;
    }

    set mobilePerso(value: any) {
        this._mobilePerso = value;
    }

    get mobilePersoCan(): any {
        return this._mobilePersoCan;
    }

    set mobilePersoCan(value: any) {
        this._mobilePersoCan = value;
    }

    get voicemailNumber(): any {
        return this._voicemailNumber;
    }

    set voicemailNumber(value: any) {
        this._voicemailNumber = value;
    }

    get emails(): any {
        return this._emails;
    }

    set emails(value: any) {
        this._emails = value;
    }

    get emailPro(): any {
        return this._emailPro;
    }

    set emailPro(value: any) {
        this._emailPro = value;
    }

    get emailPerso(): any {
        return this._emailPerso;
    }

    set emailPerso(value: any) {
        this._emailPerso = value;
    }

    get lastName(): any {
        return this._lastName;
    }

    set lastName(value: any) {
        this._lastName = value;
    }

    get firstName(): any {
        return this._firstName;
    }

    set firstName(value: any) {
        this._firstName = value;
    }

    get isTerminated(): any {
        return this._isTerminated;
    }

    set isTerminated(value: any) {
        this._isTerminated = value;
    }

    get language(): any {
        return this._language;
    }

    set language(value: any) {
        this._language = value;
    }

    get presence(): any {
        return this._presence;
    }

    set presence(value: any) {
        this._presence = value;
    }

    get status(): any {
        return this._status;
    }

    set status(value: any) {
        this._status = value;
    }

    get resources(): any {
        return this._resources;
    }

    set resources(value: any) {
        this._resources = value;
    }

    get nameUpdatePrio(): any {
        return this._nameUpdatePrio;
    }

    set nameUpdatePrio(value: any) {
        this._nameUpdatePrio = value;
    }

    get initials(): any {
        return this._initials;
    }

    set initials(value: any) {
        this._initials = value;
    }

    get nickname(): any {
        return this._nickname;
    }

    set nickname(value: any) {
        this._nickname = value;
    }

    get roster(): any {
        return this._roster;
    }

    set roster(value: any) {
        this._roster = value;
    }

    get initialized(): any {
        return this._initialized;
    }

    set initialized(value: any) {
        this._initialized = value;
    }

    get colorIndex(): any {
        return this._colorIndex;
    }

    set colorIndex(value: any) {
        this._colorIndex = value;
    }

    get color(): any {
        return this._color;
    }

    set color(value: any) {
        this._color = value;
    }

    get isInDefaultCompany(): any {
        return this._isInDefaultCompany;
    }

    set isInDefaultCompany(value: any) {
        this._isInDefaultCompany = value;
    }

    get company(): any {
        return this._company;
    }

    set company(value: any) {
        this._company = value;
    }

    get hasPhoneNumber(): any {
        return this._hasPhoneNumber;
    }

    set hasPhoneNumber(value: any) {
        this._hasPhoneNumber = value;
    }

    get guestMode(): any {
        return this._guestMode;
    }

    set guestMode(value: any) {
        this._guestMode = value;
    }

    get openInviteId(): any {
        return this._openInviteId;
    }

    set openInviteId(value: any) {
        this._openInviteId = value;
    }

    get userInfo1(): null {
        return this._userInfo1;
    }

    set userInfo1(value: null) {
        this._userInfo1 = value;
    }

    get userInfo2(): null {
        return this._userInfo2;
    }

    set userInfo2(value: null) {
        this._userInfo2 = value;
    }

    get ask(): string {
        return this._ask;
    }

    set ask(value: string) {
        this._ask = value;
    }

    get subscription(): string {
        return this._subscription;
    }

    set subscription(value: string) {
        this._subscription = value;
    }

    get temp(): boolean {
        return this._temp;
    }

    set temp(value: boolean) {
        this._temp = value;
    }

 //*/
}

module.exports = {'Contact' : Contact, 'AdminType' : AdminType, 'NameUpdatePrio' : NameUpdatePrio};
export {Contact as Contact, AdminType as AdminType, NameUpdatePrio as NameUpdatePrio};
