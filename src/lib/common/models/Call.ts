"use strict";
import {Channel} from "./Channel";

export {};


class Call {
	public status: any;
	public id: any;
	public conversationId: any;
	public connectionId: any;
	public type: any;
	public isVm: any;
	public contact: any;
	public remoteMedia: any;
	public localMedia: any;
	public isEscalated: any;
	public startDate: any;
	public isInitiator: any;
	public participants: any;
	public isRemoteVideoMuted: any;
	public isConference: any;
	public avatars: any;
	public currentCalled: any;
	public vm: any;
    public Status: any;
    public Type: any;
    public Media: any;
    public deviceType: any;
    public cause ;
    public deviceState;
    static Status: { DIALING: { value: string; key: number }; QUEUED_OUTGOING: { value: string; key: number }; ACTIVE: { value: string; key: number }; RELEASING: { value: string; key: number }; ANSWERING: { value: string; key: number }; PUT_ON_HOLD: { value: string; key: number }; CONNECTING: { value: string; key: number }; RINGING_OUTGOING: { value: string; key: number }; QUEUED_INCOMING: { value: string; key: number }; ERROR: { value: string; key: number }; UNKNOWN: { value: string; key: number }; HOLD: { value: string; key: number }; RINGING_INCOMING: { value: string; key: number } };
    static Media: { SHARING: number; VIDEO: number; PHONE: number; AUDIO: number };
    static Type: { PHONE: { value: string; key: number }; WEBRTC: { value: string; key: number } };
    public jid: undefined;
    public phoneNumber: undefined;
    public globalCallId;
    public correlatorData;

    // Static factories
    static create (status, id, type, contact, deviceType) {
        return new Call(status, id, type, contact, deviceType);
    }

    /**
     * @this Call
     */
    constructor(status, id, type, contact, deviceType) {
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
         * @public
         * @property {String} avatars array of call avatar sources
         * @readonly
         */
        this.avatars = (contact && contact.avatar) ? [this.contact.avatar.src] : [];

        /**
         * @public
         * @property {Object}  currentCalled contains current called number and contact
         * @readonly
         */
        this.currentCalled = {
            contactPhoneNumber: "",
            contact: null,
            participantsPhoneNumbers: [],
            participants: [],
        };

        /**
         * @public
         * @property {String} deviceType type of the RCC phoneset (MAIN, SECONDARY, ...).
         * @readonly
         */
        this.deviceType = deviceType;

        /**
         * @public
         * @property {String} deviceState state of the RCC phoneset.
         * @readonly
         */
        this.deviceState = undefined;

        /**
         * @public
         * @property {String} cause of the event of the call.
         * @readonly
         */
        this.cause = undefined;

        /**
         * @public
         * @property {String} jid of the called party.
         * @readonly
         */
        this.jid = undefined;

        /**
         * @public
         * @property {String} phonenumber called.
         * @readonly
         */
        this.phoneNumber = undefined;

        /**
         * @public
         * @property {String} globalCallId a global id when the call go thrue PBX Node.
         * @readonly
         */
        this.globalCallId = undefined;

        /**
         * @public
         * @property {String} correlatorData Data about a call.
         * @readonly
         */
        this.correlatorData = undefined;
    }

    getCause() {
        return this.cause;
    }

    setCause(value) {
        this.cause = value;
    }

    getDeviceState() {
        return this.deviceState;
    }

    setDeviceState(value) {
        this.deviceState = value;
    }
    getDeviceType(): any {
        return this.deviceType;
    }

    setDeviceType(value: any) {
        this.deviceType = value;
    }

    // Public methods
    setCallId (id) {
        this.id = id;
    }

    setConversationId (id) {
        this.conversationId = id;
    }

    setConnectionId (connectionId) {
        this.connectionId = connectionId;
        this.id = Call.getIdFromConnectionId(connectionId);
    }

    setStatus (status) {
        this.status = status;
    }

    setType (type) {
        this.type = type;
    }

    setIsVm (isVM) {
        this.isVm = isVM;
    }

    setContact (contact) {
        this.contact = contact;
        this.avatars = [this.contact.avatar.src];
    }

    setParticipants (participants) {
        this.participants = participants;
        this.avatars = [];
        var that = this;
        this.participants.forEach(function (participant) {
            that.avatars.push(participant.avatar.src);
        });
    }

    getGlobalCallId(): undefined {
        return this.globalCallId;
    }

    setGlobalCallId(value: undefined) {
        this.globalCallId = value;
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

            } else {//conf case
                this.currentCalled.contactPhoneNumber = "";
                this.currentCalled.contact = null;
                this.currentCalled.participantsPhoneNumbers = (currentCalled.participantsPhoneNumbers && currentCalled.participantsPhoneNumbers.length > 0) ? currentCalled.participantsPhoneNumbers : null;
                this.currentCalled.participants = (currentCalled.participants && currentCalled.participants.length > 0) ? currentCalled.participants : null;
                if (this.currentCalled.participantsPhoneNumbers && this.currentCalled.participantsPhoneNumbers.length > 0) {
                }
            }
        }
    }

    setCurrentCalledContactNumber (number) {
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
        if (!connectionId) return null ;
        return connectionId.split("#")[0] + "";
    }

    static getDeviceIdFromConnectionId(connectionId) {
        if (!connectionId) return null ;
        return connectionId.split("#")[1] + "";
    }

    /**
     * @function
     * @public
     * @name updateCall
     * @description
     * This method is used to update a Call from data object
     */
    updateCall(data) {
        let that = this;
        if (data) {

            let callproperties = Object.getOwnPropertyNames(that);
            Object.getOwnPropertyNames(data).forEach(
                (val, idx, array) => {
                    if (callproperties.find((el) => { return val == el ;})) {
                        that[val] = data[val];
                    } else {
                        console.log("WARNING : One property of the parameter of updateCall method is not present in the Call class can not update Call with : ", val);
                    }
                });
        }

        return this;
    }


    /**
     * @function
     * @public
     * @name CallFactory
     * @description
     * This method is used to create a Call from data object
     */
    public static CallFactory() {
        return (data: any): Call => {
            let call = Call.create(data.status, data.id, data.type, data.contact, data.deviceType);

            if (data) {
                let channelproperties = Object.getOwnPropertyNames(call);
                Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        if (!channelproperties.find((el) => { return val == el ;})) {
                            console.log("WARNING : One property of the parameter of CallFactory method is not present in the Call class : ");
                        }
                    });
            }

            call.updateCall(data);

            return call;
        };
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
    QUEUED_INCOMING: {
        key: 2,
        value: "queuedIncoming"
    },
    /** In queue (recipient side) */
    QUEUED_OUTGOING: {
        key: 10,
        value: "queuedOutGoing"
    },
    /** Call in ringing (user side) */
    RINGING_INCOMING: {
        key: 3,
        value: "incomingCall"
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


//module.exports = Call;

module.exports.Call = Call;
export {Call};
