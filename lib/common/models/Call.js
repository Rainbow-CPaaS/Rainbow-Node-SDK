"use strict";

class Call {}

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