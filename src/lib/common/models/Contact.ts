"use strict";
export {};


const MD5 = require("md5");
import {config, DataStoreType} from "../../config/config";
//const config = require("../../config/config");

/*************************************************************/
/* STATIC ENUM                                               */
/*************************************************************/
/**
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
 * @public
 * @enum {number}
 * @readonly
 */
const NameUpdatePrio = {
    /* no update prio then could be updated*/
    'NO_UPDATE_PRIO': 0,
    /*prio associated to outlook name resolution update*/
    'OUTLOOK_UPDATE_PRIO': 1,
    /*prio associated to server name resolution (phonebook or office365AD ...) update*/
    'SERVER_UPDATE_PRIO': 2,
    /*max prio : no update could overwrite*/
    'MAX_UPDATE_PRIO': 99
};

const textAvatarColor = ["#ff4500", "#d38700", "#348833", "#007356", "#00b2a9", "#00b0e5", "#0085ca", "#6639b7", "#91278a", "#cf0072", "#a50034", "#d20000"];


/**
 * @class
 * @name Contact
 * @description
 *      This class is used to represent a contact or the connected user <br/>
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
	public presence: any;
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

    constructor() {

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
         * @property {Object[]} resources The list of resources of the Contact
         * @instance
         */
        this.resources = "";

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

        this.userInfo1 = null;
        this.userInfo2 = null;


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
            that.emailPerso = "";//PR_14671
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

        // Compute display name
        that.computeDisplayName();
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
