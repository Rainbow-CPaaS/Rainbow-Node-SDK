"use strict";
export {};


const MD5 = require("md5");
const config = require("../../config/config");

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
	private _id: any;
	public _displayName: any;
	private _name: any;
	private _displayNameMD5: any;
	private _companyName: any;
	private _loginEmail: any;
	private _nickName: any;
	private _title: any;
	private _jobTitle: any;
	private _country: any;
	private _timezone: any;
	private _organisationId: any;
	private _siteId: any;
	private _companyId: any;
	private _jid_im: any;
	private _jid: any;
	private _jid_tel: any;
	private _jidtel: any;
	private _avatar: any;
	private _lastAvatarUpdateDate: any;
	private _lastUpdateDate: any;
	private _adminType: any;
	private _roles: any;
	private _phoneNumbers: any;
	private _phonePro: any;
	private _phoneProCan: any;
	private _phonePbx: any;
	private _phoneInternalNumber: any;
	private _pbxId: any;
	private _mobilePro: any;
	private _mobileProCan: any;
	private _phonePerso: any;
	private _phonePersoCan: any;
	private _mobilePerso: any;
	private _mobilePersoCan: any;
	private _voicemailNumber: any;
	private _emails: any;
	private _emailPro: any;
	private _emailPerso: any;
	private _lastName: any;
	private _firstName: any;
	private _isTerminated: any;
	private _language: any;
	private _presence: any;
	private _status: any;
	private _resources: any;
	private _nameUpdatePrio: any;
	private _initials: any;
	private _nickname: any;
	private _roster: any;
	private _initialized: any;
	private _colorIndex: any;
	private _color: any;
	//public isBot: any;
	private _isInDefaultCompany: any;
	private _company: any;
	private _hasPhoneNumber: any;
	private _guestMode: any;
    private _openInviteId: any;
    private _userInfo1: null;
    private _userInfo2: null;
    private _ask: string;
    private _subscription: string;
    private _temp: boolean;

    constructor() {

        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Contact
         * @instance
         */
        this._id = "";

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
        this._name = {value: this._displayName};

        this._displayNameMD5 = "";

            /**
         * @public
         * @readonly
         * @property {string} companyName The company name of the Contact
         * @instance
         */
        this._companyName = "";

        /**
         * @public
         * @readonly
         * @property {string} loginEmail The login email of the Contact
         * @instance
         * @description
         *  This field will soon become unavailable if the user is not allowed to view it, to follow the GPRD law.
         */
        this._loginEmail = "";

        /**
         * @public
         * @readonly
         * @property {string} nickName The nickname of the Contact
         * @instance
         */
        this._nickName = "";

        /**
         * @public
         * @readonly
         * @property {string} title The title of the Contact
         * @instance
         */
        this._title = "";

        /**
         * @public
         * @readonly
         * @property {string} jobTitle The job title of the Contact
         * @instance
         */
        this._jobTitle = "";

        /**
         * @public
         * @readonly
         * @property {string} country The country of the Contact
         * @instance
         */
        this._country = "";

        /**
         * @public
         * @readonly
         * @property {string} timezone The timezone of the Contact
         * @instance
         */
        this._timezone = "Europe/Paris";

        /**
         * @public
         * @readonly
         * @property {string} organisationId The organisation ID of the Contact
         * @instance
         */
        this._organisationId = "";

        /**
         * @public
         * @readonly
         * @property {string} siteId The site ID of the Contact
         * @instance
         */
        this._siteId = "";

        /**
         * @public
         * @readonly
         * @property {string} companyId The company ID of the Contact
         * @instance
         */
        this._companyId = "";

        /**
         * @public
         * @readonly
         * @property {string} jid_im The JID of the Contact
         * @instance
         */
        this._jid_im = "";

        /**
         * @public
         * @readonly
         * @property {string} jid The JID of the Contact (same as jid_im, for compatibility)
         * @instance
         */
        this._jid = "";

        /**
         * @public
         * @readonly
         * @property {string} jid_tel The JID_TEL of the Contact
         * @instance
         */
        this._jid_tel = "";

        /**
         * @public
         * @readonly
         * @property {string} jidtel The JID_TEL of the Contact (same as jidtel, for compatibility)
         * @instance
         */
        this._jidtel = "";

        /**
         * @public
         * @readonly
         * @property {string} avatar The Contact avatar, if an avatar exist will return an Url, either a local file.
         * @instance
         */
        this._avatar = "";

        /**
         * @public
         * @readonly
         * @property {string} lastAvatarUpdateDate The date of the last avatar update
         * @instance
         */
        this._lastAvatarUpdateDate = null;

        /**
         * @public
         * @readonly
         * @property {string} lastUpdateDate The date of the last time information about the contact changed
         * @instance
         */
        this._lastUpdateDate = "Z";

        /**
         * @public
         * @readonly
         * @property {string} adminType The type of admin role. Can be `organization_admin`, `company_admin`, `site_admin`
         * @instance
         */
        this._adminType = "undefined";

        /**
         * @public
         * @readonly
         * @property  {string[]} roles (For the connected user only). The associated roles of the connected user. Can be `guest`, `user`, `admin`
         * @instance
         * @description
         *  This field will soon become unavailable if the user is not allowed to view it, to follow the GPRD law.
         */
        this._roles = ["user"];

        /**
         * @public
         * @readonly
         * @property {Object[]} phoneNumbers The list of phone numbers associated to the Contact
         * @instance
         */
        this._phoneNumbers = [];

        /**
         * @public
         * @property {string} phonePro The professional phone number of the contact
         * @readonly
         */
        this._phonePro = "";

        /**
         * @public
         * @property {string} phoneProCan The professional phone number of the contact (canonical format)
         * @readonly
         */
        this._phoneProCan = "";

        /**
         * @public
         * @property {string} phonePbx The phone number if exists associated to the user and monitored by Rainbow
         * @readonly
         */
        this._phonePbx = "";

        /**
         * @public
         * @property {string} phoneInternalNumber The internal number if exists associated to the user and monitored by Rainbow
         * @readonly
         */
        this._phoneInternalNumber = "";

        /**
         * @public
         * @property {string} pbxId The ID of the PBX monitored by Rainbow where the user's phone is associated
         * @readonly
         */
        this._pbxId = "";

        /**
         * @public
         * @property {string} mobilePro The professional mobile phone of the contact
         * @readonly
         */
        this._mobilePro = "";

        /**
         * @public
         * @property {string} mobileProCan The professional mobile phone of the contact (canonical format)
         * @readonly
         */
        this._mobileProCan = "";

        /**
         * @public
         * @property {string} phonePerso The personal phone of the contact
         * @readonly
         */
        this._phonePerso = "";

        /**
         * @public
         * @property {string} phonePersoCan The personal phone of the contact (canonical format)
         * @readonly
         */
        this._phonePersoCan = "";

        /**
         * @public
         * @property {string} mobilePerso The personal mobile phone of the contact
         * @readonly
         */
        this._mobilePerso = "";

        /**
         * @public
         * @property {string} mobilePersoCan The personal mobile phone of the contact (canonical format)
         * @readonly
         */
        this._mobilePersoCan = "";

        /**
         * @public
         * @readonly
         * @property {String} voicemailNumber The number of the voicemail associated to the Contact
         * @instance
         */
        this._voicemailNumber = "";

        /**
         * @public
         * @readonly
         * @property {Object[]} emails The list of email addresses associated to the Contact
         * @instance
         */
        this._emails = [];

        /**
         * @public
         * @property {string} emailPro The professional email of the contact
         * @readonly
         */
        this._emailPro = "";

        /**
         * @public
         * @property {string} emailPerso The personal email of the contact
         * @readonly
         */
        this._emailPerso = "";

        /**
         * @public
         * @readonly
         * @property {string} lastName The lastname of the Contact
         * @instance
         */
        this._lastName = "";

        /**
         * @public
         * @readonly
         * @property {string} firstName The firstname of the Contact
         * @instance
         */
        this._firstName = "";

        /**
         * @public
         * @readonly
         * @property {Boolean} isTerminated True if the Contact has been removed
         * @instance
         */
        this._isTerminated = false;

        /**
         * @public
         * @readonly
         * @property {string} language The language of the Contact
         * @instance
         */
        this._language = "en";

        /**
         * @public
         * @readonly
         * @property {string} presence The presence of the contact. Can be `offline`, `busy`, `away`, `online`, `unknown`
         * @instance
         */
        this._presence = "";
        
        /**
         * @public
         * @readonly
         * @property {string} status An additional status information for the presence. Can be `phone`, `presentation`, `mobile` or ``
         * @instance
         */
        this._status = "";

        /**
         * @public
         * @readonly
         * @property {Object[]} resources The list of resources of the Contact
         * @instance
         */
        this._resources = "";

        /**
         * @public
         * @property {number} nameUpdatePrio Prio of the service having made an update
         * @readonly
         */
        this._nameUpdatePrio = NameUpdatePrio.MAX_UPDATE_PRIO;//default Max prio

        /**
         * @public
         * @property {string} initials The initials of the contact
         * @readonly
         */
        this._initials = "";

        /**
         * @public
         * @property {string} nickname The nickname of the contact
         * @readonly
         */
        this._nickname = "";

        /**
         * @public
         * @property {boolean} roster True if the contact is part of the favorized contact's list of the connected user
         * @readonly
         */
        this._roster = false;

        /**
         * @private
         * @readonly
         */
        this._initialized = false;

        /**
         * @public
         * @property {boolean} guestMode Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration.
         * @readonly
         */
        this._guestMode = false;

        /**
         * @public
         * @property {string} id The open invite ID of the user
         * @readonly
         */
        this._openInviteId = null;

        /**
         * @public
         * @property {string} ask (Contact Only) The subscription progress
         * @readonly
         */
        this._ask = "none";

        /**
         * @public
         * @property {string} subscription (Contact only) The subscription state for this contact (none or both)
         * @readonly
         */
        this._subscription = "none";

        // Status
        /**
         * @private
         * @readonly
         */
        this._temp = false;

        this._userInfo1 = null;
        this._userInfo2 = null;


    }

    /**
     * @public
     * @readonly
     * @property {string} displayName The display name of the Contact
     * @instance
     */

    set displayName(value) {
        this._displayName = value;
        this._name.value = value;
        this._displayNameMD5 = MD5(value);
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
                this._nameUpdatePrio = prio ;
                break;
            default://no change
        }
    }

    getNameUpdatePrio () {
        return this._nameUpdatePrio;
    }

    displayNameForLog () {
        /*if (config && config.debug) {
            return this.displayName;
        } // */
        return this._displayNameMD5;
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
        this._initials = initials;

        // Compute contact color
        let upperCaseDisplayName = this.displayName.toUpperCase();
        let sum = 0;

        for (let i = 0; i < upperCaseDisplayName.length; i++) {
            sum += upperCaseDisplayName.charCodeAt(i);
        }

        this._colorIndex = (sum % 12);
        this._color = textAvatarColor[this._colorIndex];
    }

    computeDisplayName () {
        let firstName = this._firstName ? (this._firstName.charAt(0).toUpperCase() + this._firstName.slice(1)) : null;
        let lastName = this._lastName ? (this._lastName.charAt(0).toUpperCase() + this._lastName.slice(1)) : null;
        let nickName = this._nickname ? (this._nickname.charAt(0).toUpperCase() + this._nickname.slice(1)) : null;
        if (lastName && firstName) {
            this.computeCompleteDisplayName(firstName, lastName);
        }
        else if (lastName && !firstName) {
            this.displayName = lastName;
            this._initials = lastName.charAt(0);
        }
        else if (nickName) {
            this.displayName = nickName;
            this._initials = nickName.charAt(0);
        }
        else {
            this.displayName = "Anonymous";
            this._initials = "A";
        }
    }

    updateName (firstName, lastName) {
        let that = this;
        // Identification fields
        that._firstName = firstName;
        that._lastName = lastName;
        // Compute display name
        that.computeDisplayName();
    }

    updateFromUserData (userData) {
        let that = this;
        // Identification fields
        that._id = userData._id;
        that._id = userData._id;
        that._loginEmail = userData._loginEmail;
        that._firstName = userData._firstName;
        that._lastName = userData._lastName;
        that._nickname = userData._nickName ? userData._nickName : "";
        that._title = userData._title ? userData._title : "";
        that._jobTitle = userData._jobTitle ? userData._jobTitle : "";
        that._organisationId = userData._organisationId;
        that._siteId = userData._siteId;
        that._country = userData._country ? userData._country : "FRA";
        that._timezone = userData._timezone;
        that._roles = userData._roles;
        that._adminType = userData._adminType;
        //that.isBot = false;
        that._isTerminated = userData._isTerminated;
        that._isInDefaultCompany = userData._isInDefaultCompany;
        that._lastAvatarUpdateDate = userData._lastAvatarUpdateDate;
        that._initialized = userData.isInitialized;
        that._avatar = userData._avatar;
        that._guestMode = userData._guestMode ? userData._guestMode : false;
        that._openInviteId = userData._openInviteId ? userData._openInviteId : that._openInviteId;
        that._userInfo1 = that._userInfo1 ? that._userInfo1 : userData._userInfo1;
        that._userInfo2 = that._userInfo2 ? that._userInfo2 : userData._userInfo2;

        // Handle jids
        if (userData._jid_im) {
            that._id = userData._jid_im;
            that._jid = userData._jid_im;
            that._jidtel = userData._jid_tel;
            that._jid_im = userData._jid_im;
            that._jid_tel = userData._jid_tel;
        }

        // Company field
        if (!that._company || that._company._id !== userData._companyId) {
            // this.company = Company.create(userData.companyId, userData.companyName);
        }

        // Telephony fields
        that._phonePro = that._phoneProCan = "";
        that._phonePbx = userData._phonePbx + "";
        that._phoneInternalNumber = "";//#29475
        that._pbxId = "";
        that._mobilePro = that._mobileProCan = "";
        that._phonePerso = that._phonePersoCan = "";
        that._mobilePerso = that._mobilePersoCan = "";
        that._voicemailNumber = "";
        that._hasPhoneNumber = false;

        that._roster = that._roster ? that._roster : false;
        that._presence = that._presence ? that._presence : "offline";
        that._status = that._status ? that._status : "";

        // Update emails
        if (userData._emails) {
            that._emailPerso = "";//PR_14671
            userData._emails.forEach(function (email) {
                switch (email.type) {
                    case "work":
                        that._emailPro = email.email;
                        break;
                    case "home":
                        that._emailPerso = email.email;
                        break;
                    default:
                        break;
                }
            });
        }

        // Update phone numbers
        if (userData._phoneNumbers) {
            that._phoneNumbers = userData._phoneNumbers;
            that._phoneNumbers.forEach(function (phoneNumber) {
                let number = phoneNumber.number;
                let numberCan = phoneNumber.numberE164;
                let deviceType = phoneNumber.deviceType;
                that._hasPhoneNumber = true;
                switch (phoneNumber.type) {
                    case "work":
                        if (deviceType === "landline") {
                            that._phonePro = number;
                            that._phoneProCan = numberCan;
                            if (phoneNumber.isFromSystem) {
                                that._phonePbx = phoneNumber.shortNumber;
                                if (phoneNumber.internalNumber) { //#29475++
                                    that._phoneInternalNumber = phoneNumber.internalNumber;
                                } //#29475--
                                that._pbxId = phoneNumber._pbxId;
                                that._voicemailNumber = phoneNumber.voiceMailNumber;
                            }
                        }
                        if (deviceType === "mobile") {
                            that._mobilePro = number;
                            that._mobileProCan = numberCan;
                        }
                        break;
                    case "home":
                        if (deviceType === "landline") {
                            that._phonePerso = number;
                            that._phonePersoCan = numberCan;
                        }
                        if (deviceType === "mobile") {
                            that._mobilePerso = number;
                            that._mobilePersoCan = numberCan;
                        }
                        break;
                    default:
                        break;
                }
            });
        } else {
            that._phoneNumbers = [];
            that._phonePro = "";
            that._phoneProCan = "";
            that._phonePbx = "";
            that._phoneInternalNumber = "";
            that._pbxId = "";
            that._voicemailNumber = "";
            that._mobilePro = "";
            that._mobileProCan = "";
            that._phonePerso = "";
            that._phonePersoCan = "";
        }

        // Compute display name
        that.computeDisplayName();
    }

    isGuest() {
        return this._guestMode;
    };

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
}

module.exports = {'Contact' : Contact, 'AdminType' : AdminType, 'NameUpdatePrio' : NameUpdatePrio};
export {Contact as Contact, AdminType as AdminType, NameUpdatePrio as NameUpdatePrio};