"use strict";

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
 *      A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information that are only shared with contacts that are in the user's network or in the same company (email, phone numbers...)
 */
class Contact {
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
         * @property {string} jid_tel The JID_TEL of the Contact
         * @instance
         */
        this.jid_tel = "";

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
         * @property {string} roles The role of the Contact. Can be `guest`, `user`, `admin`
         * @instance
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
         * @readonly
         * @property {Object[]} emails The list of email addresses associated to the Contact
         * @instance
         */
        this.emails = [];

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
        var displayName = "";
        var initials = "";
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
        var upperCaseDisplayName = this.displayName.toUpperCase();
        var sum = 0;

        for (var i = 0; i < upperCaseDisplayName.length; i++) {
            sum += upperCaseDisplayName.charCodeAt(i);
        }

        this.colorIndex = (sum % 12);
        this.color = textAvatarColor[this.colorIndex];
    }

    computeDisplayName () {
        var firstName = this.firstname ? (this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1)) : null;
        var lastName = this.lastname ? (this.lastname.charAt(0).toUpperCase() + this.lastname.slice(1)) : null;
        var nickName = this.nickname ? (this.nickname.charAt(0).toUpperCase() + this.nickname.slice(1)) : null;
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
        that.firstname = firstName;
        that.lastname = lastName;
        // Compute display name
        that.computeDisplayName();
    }

    updateFromUserData (userData) {
        // Identification fields
        this._id = userData.id;
        this.loginEmail = userData.loginEmail;
        this.firstname = userData.firstName;
        this.lastname = userData.lastName;
        this.nickname = userData.nickName ? userData.nickName : "";
        this.title = userData.title ? userData.title : "";
        this.jobTitle = userData.jobTitle ? userData.jobTitle : "";
        this.organisationId = userData.organisationId;
        this.siteId = userData.siteId;
        this.country = userData.country ? userData.country : "FRA";
        this.timezone = userData.timezone;
        this.roles = userData.roles;
        this.adminType = userData.adminType;
        this.isBot = false;
        this.isTerminated = userData.isTerminated;
        this.isInDefaultCompany = userData.isInDefaultCompany;
        this.lastAvatarUpdateDate = userData.lastAvatarUpdateDate;
        this.initialized = userData.isInitialized;

        // Handle jids
        if (userData.jid_im) {
            this._id = userData.jid_im;
            this.jid = userData.jid_im;
            this.jidtel = userData.jid_tel;
        }

        // Company field
        if (!this.company || this.company.id !== userData.companyId) {
            // this.company = Company.create(userData.companyId, userData.companyName);
        }

        // Telephony fields
        this.phonePro = this.phoneProCan = "";
        this.phonePbx = "";
        this.phoneInternalNumber = "";//#29475
        this.pbxId = "";
        this.mobilePro = this.mobileProCan = "";
        this.phonePerso = this.phonePersoCan = "";
        this.mobilePerso = this.mobilePersoCan = "";
        this.voicemailNumber = "";
        this.hasPhoneNumber = false;

        // Update emails
        var that = this;
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
            userData.phoneNumbers.forEach(function (phoneNumber) {
                var number = phoneNumber.number;
                var numberCan = phoneNumber.numberE164;
                var deviceType = phoneNumber.deviceType;
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
        }

        // Compute display name
        this.computeDisplayName();
    }

}

module.exports = {'Contact' : Contact, 'AdminType' : AdminType, 'NameUpdatePrio' : NameUpdatePrio};