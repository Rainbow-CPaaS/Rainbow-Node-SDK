"use strict";

class Call {
    // Static factories
    static create (status, id, type, contact) {
        return new Call(status, id, type, contact);
    }

    /**
     * @this Call
     */
    constructor(status, id, type, contact) {
        /**
         * @public
         * @property {Object} status The status of the call (e.g. dialing, active, releasing...)
         * @readonly
         */
        this.status = status;

        /**
         * @public
         * @property {string} id the id of the call
         * @readonly
         */     
        this.id = id;

        /**
         * @public
         * @property {string} conversationId The reference of the conversation
         * @readonly
         */
        this.conversationId = null;

        /**
         * @private
         * @property {string} connectionId ??
         * @readonly
         */
        this.connectionId = null;

        /**
         * @public
         * @property {Object} type The type of the call (e.g. webRTC or Telephony)
         * @readonly
         */
        this.type = type;

        /**
         * @private
         * @property {Boolean} isVm Indicates whether it is a call to user's own voicemail
         * @readonly
         */
        this.isVm = false;

        /**
         * @public
         * @property {Contact} contact The reference of the contact engaged in this call
         * @readonly
         */
        this.contact = contact;

        /**
         * @public
         * @property {Number} remoteMedia The media used by the recipient (e.g. audio, video, sharing, phone)
         * @readonly
         */
        this.remoteMedia = 0;

        /**
         * @public
         * @property {Number} localMedia The media used by the user (e.g. audio, video, sharing, phone)
         * @readonly
         */
        this.localMedia = 0;

        /**
         * @public
         * @property {Boolean} isEscalated True if the call has been escalated to sharing or video (only relevant for WebRTC calls)
         * @readonly
         */
        this.isEscalated = false;

        /**
         * @public
         * @property {Date} startDate The date when the call has been started
         * @readonly
         */
        this.startDate = new Date();

        /**
         * @public
         * @property {Boolean} isInitiator True if the user is the caller (false if he's the called)
         * @readonly
         */
        this.isInitiator = false;

        /**
         * @public
         * @property {Contact[]} participants The list of participants in the call (conference)
         * @readonly
         */
        this.participants = null;

        /**
         * @public
         * @property {Boolean} isRemoteVideoMuted True if the webRTC video has been muted by the recipient (only relevant for WebRTC calls)
         * @readonly
         */
        this.isRemoteVideoMuted = false;

        /**
         * @public
         * @since 1.20
         * @property {Boolean} isConference True if the call is a conferenceCall
         * @readonly
         */
        this.isConference = false;

        /**
         * @private
         * @property {String} avatars array of call avatar sources
         * @readonly
         */
        this.avatars = (contact && contact.avatar) ? [this.contact.avatar.src] : [];

        /**
         * @private
         * @property {Object}  currentCalled contains current called number and contact
         * @readonly
         */
        this.currentCalled = {
            contactPhoneNumber: "",
            contact: null,
            participantsPhoneNumbers: [],
            participants: [],
        };


        // $log.debug("[CALL] createCall : " + this);
    }

    // Public methods
    setCallId (id) {
        this.id = id;
        // $log.debug("[CALL] setId : " + this);
    }

    setConversationId (id) {
        this.conversationId = id;
        // $log.debug("[CALL] setConversationId : " + this);
    }

    setConnectionId (connectionId) {
        this.connectionId = connectionId;
        this.id = Call.getIdFromConnectionId(connectionId);
        // $log.debug("[CALL] setId : " + this);
    }

    setStatus (status) {
        this.status = status;
        // $log.debug("[CALL] setStatus : " + this);
    }

    setType (type) {
        this.type = type;
        // $log.debug("[CALL] setType : " + this);
    }

    setIsVm (isVM) {
        this.isVm = isVM;
        // $log.debug("[CALL] setVm : " + this);
    }

    setContact (contact) {
        this.contact = contact;
        this.avatars = [this.contact.avatar.src];
        // $log.debug("[CALL] setContact : " + contact);
    }

    setParticipants (participants) {
        this.participants = participants;
        this.avatars = [];
        var that = this;
        this.participants.forEach(function (participant) {
            that.avatars.push(participant.avatar.src);
        });
        // $log.debug("[CALL] setParticipants : " + participants.join());
    }

    getCurrentCalled  () {
        return this.currentCalled;
    }

    setCurrentCalled (currentCalled) {
        if (!currentCalled) {
            this.currentCalled.contactPhoneNumber = "";
            this.currentCalled.contact = null;
            this.currentCalled.participantsPhoneNumbers = null;
            this.currentCalled.participants = null;
        } else {
            if (this.contact && this.contact._id) {//simple call case
                this.currentCalled.contactPhoneNumber = (currentCalled.contactPhoneNumber && currentCalled.contactPhoneNumber !== "") ? currentCalled.contactPhoneNumber : "";
                this.currentCalled.contact = currentCalled.contact ? currentCalled.contact : null;
                this.currentCalled.participantsPhoneNumbers = null;
                this.currentCalled.participants = null;
                // $log.debug("[CALL] setCurrentCalled contactPhoneNumber : " + currentCalled.contactPhoneNumber);
                // $log.debug("[[TelephonyServiceEventHandler]] setCurrentCalled call " + this.id + " contactPhoneNumber = " + currentCalled.contactPhoneNumber);

            } else {//conf case
                this.currentCalled.contactPhoneNumber = "";
                this.currentCalled.contact = null;
                this.currentCalled.participantsPhoneNumbers = (currentCalled.participantsPhoneNumbers && currentCalled.participantsPhoneNumbers.length > 0) ? currentCalled.participantsPhoneNumbers : null;
                this.currentCalled.participants = (currentCalled.participants && currentCalled.participants.length > 0) ? currentCalled.participants : null;
                if (this.currentCalled.participantsPhoneNumbers && this.currentCalled.participantsPhoneNumbers.length > 0) {
                    // $log.debug("[CALL] setCurrentCalled participantsPhoneNumbers : " + currentCalled.participantsPhoneNumbers.join());
                    // $log.debug("[[TelephonyServiceEventHandler]] setCurrentCalled " + this.id + " participantsPhoneNumbers : " + currentCalled.participantsPhoneNumbers.join());
                }
            }
        }
    }

    setCurrentCalledContactNumber (number) {
        // $log.debug("[[TelephonyServiceEventHandler]] setCurrentCalledContactNumber call " + this.id + " phoneNumber = " + number);
        this.currentCalled.contactPhoneNumber = number;
    }

    // Override toString method
    toString () {
        return "(type:" + this.type.value + ", id:" + this.id + ", status:" + this.status.value + (this.vm ? "(voicemail))" : ")");
    }

    /*********************************************************/
    /**                  TELEPHONY STUFF                     */
    /*********************************************************/
    static getIdFromConnectionId(connectionId) {
        return connectionId.split("#")[0];
    }

    static getDeviceIdFromConnectionId(connectionId) {
        return connectionId.split("#")[1];
    }

}


/**
 * @public
 * @readonly
 * @enum {Object}
 */
Call.Status = {
    /** Call cleared */
    UNKNOWN: {
        key: 0,
        value: "Unknown"
    },
    /** In dialing */
    DIALING: {
        key: 1,
        value: "dialing"
    },
    /** In queue (user side) */
    QUEUED_INCOMMING: {
        key: 2,
        value: "queuedIncomming"
    },
    /** In queue (recipient side) */
    QUEUED_OUTGOING: {
        key: 10,
        value: "queuedOutGoing"
    },
    /** Call in ringing (user side) */
    RINGING_INCOMMING: {
        key: 3,
        value: "incommingCall"
    },
    /** Call in ringing (recipient side */
    RINGING_OUTGOING: {
        key: 4,
        value: "ringingOutgoing"
    },
    /** Active call */
    ACTIVE: {
        key: 5,
        value: "active"
    },
    /** Call in hold */
    HOLD: {
        key: 6,
        value: "held"
    },
    /** Call put on hold */
    PUT_ON_HOLD: {
        key: 7,
        value: "putOnHold"
    },
    /** Call is clearing */
    RELEASING: {
        key: 8,
        value: "releasing"
    },
    /** call is answering */
    ANSWERING: {
        key: 9,
        value: "answering"
    },
    /** trying to reconnect */
    CONNECTING: {
        key: 12,
        value: "connecting"
    },
    /** call in error */
    ERROR: {
        key: 11,
        value: "error"
    }
};

/**
 * @public
 * @enum {Object}
 * @readonly
 */
Call.Type = {
    /** WebRTC call */
    WEBRTC: {
        key: 1,
        value: "Video"
    },
    /** Telephony call (from PBX) */
    PHONE: {
        key: 2,
        value: "Phone"
    }
};

/**
 * @public
 * @enum {Object}
 * @readonly
 */
Call.Media = {
    /** WebRTC audio call */
    AUDIO: 1,
    /** WebRTC audio and video call */
    VIDEO: 2,
    /** Telephony call (from pbx) */
    PHONE: 4,
    /** WebRTC Screen sharing call */
    SHARING: 8
};


module.exports = Call;