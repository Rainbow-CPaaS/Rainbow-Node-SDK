"use strict";
export {};

/*************************************************************/
/* INVITATION CONSTRUCTOR                                  */

/*************************************************************/
import {publicDecrypt} from "crypto";

/**
 * @class
 * @name Invitation
 * @public
 * @description
 *      This class is used to represent an invitation received or sent by/to user <br/>
 */
class Invitation {
    public id: any;
    public invitedUserId: any;
    public invitedUserEmail: any;
    public invitedPhoneNumber: any;
    public invitingUserId: any;
    public invitingUserEmail: any;
    public requestNotificationLanguage: any;
    public invitingDate: any;
    public lastNotificationDate: any;
    public status: any;
    public type: any;
    public defaultAvatar: null;
    public inviteToJoinMeeting: any;

    constructor(id, invitedUserId, invitedUserEmail, invitingUserId, invitingUserEmail, requestNotificationLanguage, invitingDate,
                lastNotificationDate, status, type, inviteToJoinMeeting, invitedPhoneNumber) {

        /**
         * @public
         * @property {string} id The invitation ID
         * @readonly
         */
        this.id = id;

        /**
         * @public
         * @property {string} invitedUserId The invited user unique Rainbow id
         * @readonly
         */
        this.invitedUserId = invitedUserId;

        /**
         * @public
         * @property {string} invitedUserEmail The invited user email
         * @readonly
         */
        this.invitedUserEmail = invitedUserEmail;

        /**
         * @public
         * @property {string} invitedPhoneNumber The invited user Phone Number
         * @readonly
         */
        this.invitedPhoneNumber = invitedPhoneNumber;

        /**
         * @private
         * @property {string} invitingUserId The inviting user unique Rainbow Id
         * @readonly
         */
        this.invitingUserId = invitingUserId;

        /**
         * @private
         * @property {string} invitingUserEmail The inviting user loginEmail
         * @readonly
         */
        this.invitingUserEmail = invitingUserEmail;

        // Status
        /**
         * @private
         * @property {string} requestNotificationLanguage The request notification language
         * @readonly
         */
        this.requestNotificationLanguage = requestNotificationLanguage;

        /**
         * @public
         * @property {string} invitingDate The date the invitation was created.
         * @readonly
         */
        this.invitingDate = invitingDate;

        /**
         * @public
         * @property {string} lastnotificationDate The date when the last email notification was sent.
         * @readonly
         */
        this.lastNotificationDate = lastNotificationDate;//fix #24157

        /**
         * @public
         * @property {string} status The invitation status.
         * @readonly
         */
        this.status = status;

        /**
         * @public
         * @property {string} type The invitation type.
         * @readonly
         */
        this.type = type;

        /**
         * @public
         * @property {string} defaultAvatar The invitation defaultAvatar.
         * @readonly
         */
        this.defaultAvatar = null;

        /**
         * @public
         * @property {boolean} inviteToJoinMeeting True if joinRoom invitation.
         * @readonly
         */
        this.inviteToJoinMeeting = inviteToJoinMeeting;
    }

    createDefaultAvatar() {
        /* if (!this.defaultAvatar && this.invitedUserEmail) {
            var color = userInfoService.computeUserColor(this.invitedUserEmail);
            var initials = this.invitedUserEmail.substring(0, 2).toUpperCase();
            this.defaultAvatar = userInfoService.createDefaultAvatarImage(initials, color);
        } // */
    };


    /*************************************************************/
    /* STATIC FACTORIES                                          */

    /*************************************************************/
    public static create(id, invitedUserId, invitedUserEmail, invitingUserId, invitingUserEmail, requestNotificationLanguage, invitingDate, lastNotificationDate, status, type, inviteToJoinMeeting, invitedPhoneNumber) {
        return new Invitation(id, invitedUserId, invitedUserEmail, invitingUserId, invitingUserEmail, requestNotificationLanguage, invitingDate, lastNotificationDate, status, type, inviteToJoinMeeting, invitedPhoneNumber);
    }

    public static createFromData(invitationData) {
        let invitation = new Invitation(invitationData.id, invitationData.invitedUserId, invitationData.invitedUserEmail,
            invitationData.invitingUserId, invitationData.invitingUserEmail, invitationData.requestNotificationLanguage,
            invitationData.invitingDate, invitationData.lastNotificationDate, invitationData.status, invitationData.type,
            invitationData.inviteToJoinMeeting, invitationData.invitedPhoneNumber);
        invitation.createDefaultAvatar();
        return invitation;
    }
}

module.exports = {'Invitation' : Invitation};
export {Invitation as Invitation};

