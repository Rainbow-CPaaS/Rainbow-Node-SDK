"use strict";

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
        this.id = "581b40a9383b2852d37aa099";

        /**
         * @public
         * @readonly
         * @property {string} displayName The display name of the Contact
         * @instance
         */
        this.displayName = "Virginia Pittman";

        /**
         * @public
         * @readonly
         * @property {string} companyName The company name of the Contact
         * @instance
         */
        this.companyName = "AL-E SDK Westworld Guest";

        /**
         * @public
         * @readonly
         * @property {string} loginEmail The login email of the Contact
         * @instance
         */
        this.loginEmail = "vpittman@westworld.com";

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
        this.country = "CZE";

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
        this.companyId = "5805e150383b2852d37a9e64";

        /**
         * @public
         * @readonly
         * @property {string} jid_im The JID of the Contact
         * @instance
         */
        this.jid_im = "1bd0991c11ad4d55b140ac4cdc806176@sandbox-all-in-one-prod-1.opentouch.cloud";

        /**
         * @public
         * @readonly
         * @property {string} jid_tel The JID_TEL of the Contact
         * @instance
         */
        this.jid_tel = "tel_1bd0991c11ad4d55b140ac4cdc806176@sandbox-all-in-one-prod-1.opentouch.cloud";

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
        this.lastUpdateDate = "2017-03-05T11:06:21.937Z";

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
        this.lastName = "Pittman";

        /**
         * @public
         * @readonly
         * @property {string} firstName The firstname of the Contact
         * @instance
         */
        this.firstName = "Virginia";

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
        this.presence = "online";
        
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
    }
}

module.exports = Contact;