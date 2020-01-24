"use strict";
export {};


function CallLog(id, contact, state, duration, type?, read?, date?, direction?, callSubject?, isLatestCall?) {
    /**
     * @public
     * @property {string} id The CallLog ID
     * @readonly
     */
    this.id = id;

    /**
     * @public
     * @property {Contact} contact The Contact related to the call log
     * @link Contact
     * @readonly
     */
    this.contact = contact;


    this.state = state;
    this.duration = duration;
    this.direction = direction;
    this.callSubject = callSubject;
    this.isLatestCall = isLatestCall;

    if (type === "unknown" || type === "audio" || type === "webrtc") {
        type = CallLog.Type.WEBRTC;
    } else if (type === "telephone") {
        type = CallLog.Type.TELEPHONE;
    } else {
        type = CallLog.Type.CONFERENCE;
    }

    this.type = type;
    this.read = read;
    this.date = date;

    // this.startDate = startDate;
    // this.endDate = endDate;
    // this.contactId = contactId;
    // this.contact = null;
    // this.direction = direction;
    // this.isTelephony = false;
    // this.isMissed = false;
    // this.isNotAnswered = false;
    // this.isWebRTCAudioCall = false;
}

CallLog.create = function (id, contact, state, duration, type, read, date, direction, callSubject, isLatestCall) {
    let callLog = new CallLog(id, contact, state, duration, type, read, date, direction, callSubject, isLatestCall);
    return callLog;
};

CallLog.getNames = function (callLog) {
    let result = {
        firstName: "",
        lastName: "",
        date:0
    };

    try {
        if (callLog && callLog.contact) {
            result.firstName = callLog.contact.firstName.toUpperCase();
            result.lastName = callLog.contact.lastName.toUpperCase();

            if (callLog && callLog.date) {
                result.date = callLog.date.getTime();
            }
        }
    } catch (err) {

    }

    return result;
};

CallLog.getDate = function (callLog) {
    if (callLog && callLog.date) {
        return callLog.date.getTime();
    }

    return 0;
};

CallLog.sortByContact = function (callLogA, callLogB) {
    let res = -1;

    try {
        if (callLogA && callLogA.lastName && callLogB && callLogB.lastName) {
            let str1 = callLogA.lastName;
            let str2 = callLogB.lastName;
            res = str1.localeCompare(str2);
            if (res === 0) {
                str1 = callLogA.firstName;
                str2 = callLogB.firstName;

                res = str1.localeCompare(str2);

                if (res === 0 && callLogB.date && callLogA.date) {
                    //order by date
                    res = CallLog.sortByDate(callLogA.date, callLogB.date);
                }
            }
        }
    } catch (err) {

    }

    return res;
};

CallLog.sortByDate = function (callLogA, callLogB) {

    let res = 0;
    if (callLogA && callLogB) {
        if (callLogA <  callLogB) {
            res = -1;
        }
        if (callLogA >  callLogB) {
            res = 1;
        }
    }

    // dev-code //
    //res = 1;
    // end-dev-code //

    return res;

/*    let res = 1;
    if (callLogA && callLogB) {
        res = callLogB.value - callLogA.value;
    }

    return res; // */
};

CallLog.Type = {
    /** WebRTC call */
    WEBRTC: "webrtc",
    /** Telephony call (from PBX) */
    TELEPHONE: "telephone",
    /** Conference call (from PBX) */
    CONFERENCE: "conference"
};


module.exports = CallLog;

