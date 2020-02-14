"use strict";
import {accessSync} from "fs";
import {XMPPService} from "../XMPPService";
import {logEntryExit} from "../../common/Utils";

export {};


const Utils = require("../../common/Utils");
const GenericHandler = require("./genericHandler");
//const Conversation = require("../../common/models/Conversation");
//const NameUpdatePrio = require("../../common/models/Contact").NameUpdatePrio;
const moment = require("moment");
const Deferred = require("../../common/Utils").Deferred;
const CallLog = require("../../common/models/CallLog");

const xml = require("@xmpp/xml");
const PromiseQueue = require("../../common/promiseQueue");

const orderByFilter = require("../../common/Utils").orderByFilter;

//const config = require("../../config/config");
import {config, DataStoreType} from "../../config/config";

const LOG_ID = "XMPP/HNDL/TEL/CLOG - ";

/*********************************************************************/
/** PRIVATE CONSTRUCTOR                                             **/
/*********************************************************************/

@logEntryExit(LOG_ID)
class CallLogEventHandler extends GenericHandler {
	public MESSAGE: any;
	public IQ_RESULT: any;
	public IQ_ERROR: any;
	public IQ_CALLLOG: any;
	public CALLLOG_ACK: any;
	public IQ_CALLOG_NOTIFICATION: any;
	public calllogService: any;
	public contactService: any;
	public profileService: any;
	public telephonyService: any;
	public callLogsPromises: any;
	public calllogs: any;
	public onIqCallLogReceived: any;
	public onCallLogAckReceived: any;
	public onIqCallLogNotificationReceived: any;
	public logger: any;
	public callLogs: any;

    constructor(xmppService : XMPPService, calllogService, contactService, profileService, telephonyService) {
        super(xmppService);

        //let self = this;
        this.MESSAGE = "jabber:client.message";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        //this.callLogRequestNS = "jabber:iq:webrtc:call:log";
        this.IQ_CALLLOG = "jabber:iq:telephony:call_log";
        this.CALLLOG_ACK = "urn:xmpp:telephony:call_log:receipts";
        this.IQ_CALLOG_NOTIFICATION = "jabber:iq:notification:telephony:call_log";

        this.calllogService = calllogService;
        this.contactService = contactService;
        this.profileService = profileService;
        this.telephonyService = telephonyService;

        this.callLogsPromises = [];

        this.calllogs = {

            "callLogs": [],
            "orderByNameCallLogs": [],
            "orderByDateCallLogs": [],
            "orderByNameCallLogsBruts": [],
            "orderByDateCallLogsBruts": [],
            "simplifiedCallLogs": [],
            "numberMissedCalls": 0,

            "lastTimestamp": null
        };

        //this.promiseQueue = PromiseQueue.createPromiseQueue(that.logger);

        // C:\Projets\RandD\Rainbow\Sources\CPaas\Rainbow-Node-SDK - sample2\node_modules\ltx\lib\Element.js

        this.onIqCallLogReceived = (msg, stanza) => {
            let that = this;
            that.logger.log("internal", LOG_ID + "(onIqCallLogReceived) received - 'stanza'", msg, stanza);
            try {
                //that.logger.log("info", LOG_ID + "[callLogService] onCallLogMessageReceived");
                //handle message
                if (stanza.find("call_log").length > 0) {
                    that.callLogsPromises.push(that.createCallLogFromMessage(stanza));
                }
                //handle end of logs
                else if (stanza.find("count").length > 0 && stanza.find("query").length > 0) {
                    //save last message timestamp
                    that.calllogs.lastTimestamp = stanza.find("last").text();
                    that.logger.log("info", LOG_ID + "(onIqCallLogReceived) : all call logs received");

                    if (that.callLogsPromises.length > 0) {
                        Promise.all(that.callLogsPromises).then(() => {
                            that.logger.log("info", LOG_ID + "(onIqCallLogReceived) : all call logs are ready");

                            that.callLogsPromises = [];

                            that.orderCallLogsFunction();

                            let oldMissedCallLogCounter = that.calllogs.numberMissedCalls;
                            let num = that.getMissedCallLogCounter();

                            // $rootScope.$broadcast("ON_CALL_LOG_UPDATED");
                            that.eventEmitter.emit("evt_internal_calllogupdated", that.calllogs);

                            if (num !== oldMissedCallLogCounter) {
                                that.eventEmitter.emit("evt_internal_calllogackupdated", that.calllogs);
                                // $rootScope.$broadcast("ON_CALL_LOG_ACK_UPDATED");
                            }
                        });
                    }
                }
                //handle other messages
                else {
                    that.logger.log("info", LOG_ID + "(onIqCallLogReceived) : ignored stanza for calllog !");
                }
            } catch (error) {
                that.logger.log("error", LOG_ID + "(onIqCallLogReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onIqCallLogReceived) CATCH Error !!! : ", error);
                return true;
            }

            return true;
        };

        this.onCallLogAckReceived = (msg, stanza) => {
            let that = this;
            that.logger.log("internal", LOG_ID + "(onCallLogAckReceived) received - 'stanza'", msg, stanza);
            try {
                that.logger.log("info", LOG_ID + "(onCallLogAckReceived) received");
                //console.log(stanza);

                let read = stanza.find("read");
                if (read.length > 0) {

                    let msgId = stanza.find("read").attr("call_id");
                    that.callLogAckUpdate(msgId);

                    let oldMissedCallLogCounter = that.calllogs.numberMissedCalls;
                    let num = that.getMissedCallLogCounter();
                    if (num !== oldMissedCallLogCounter) {
                        that.eventEmitter.emit("evt_internal_calllogackupdated", that.calllogs);
                        //$rootScope.$broadcast("ON_CALL_LOG_ACK_UPDATED");
                    }
                }

            } catch (error) {
                that.logger.log("error", LOG_ID + "(onCallLogAckReceived) ");
                that.logger.log("internalerror", LOG_ID + "(onCallLogAckReceived) : " + error);
                return true;
            }

            return true;
        };

        this.onIqCallLogNotificationReceived = async(msg, stanza) => {
            let that = this;

            that.logger.log("internal", LOG_ID + "(onIqCallLogNotificationReceived) received - 'stanza'", msg, stanza);
            that.logger.log("info", LOG_ID + "(onIqCallLogNotificationReceived) received");
            //console.log(stanza);

            try {
                let deleted_call_log = stanza.find("deleted_call_log");
                let updated_call_log = stanza.find("updated_call_log");
                if (deleted_call_log.length > 0) {
                    that.logger.log("info", LOG_ID + "(onIqCallLogNotificationReceived) deleted IQ");
                    let peer = stanza.find("deleted_call_log").attr("peer");

                    //no given user JID, reset all call-logs
                    if (!peer) {
                        that.logger.log("info", LOG_ID + "(onIqCallLogNotificationReceived) no given user JID, reset all call-logs");
                        await that.resetCallLogs();
                        await that.calllogService.getCallLogHistoryPage();
                    } else {
                        that.removeCallLogsForUser(peer);
                    }
                } else if (updated_call_log.length > 0) {
                    that.logger.log("info", LOG_ID + "(onIqCallLogNotificationReceived)  : Update call-logs");

                    that.callLogsPromises.push(that.createCallLogFromMessage(stanza));

                    Promise.all(that.callLogsPromises)
                        .then(function () {
                            that.logger.log("info", LOG_ID + "(onIqCallLogNotificationReceived) : update is done");

                            that.callLogsPromises = [];

                            that.orderCallLogsFunction();

                            let oldMissedCallLogCounter = that.calllogs.numberMissedCalls;
                            let num = that.getMissedCallLogCounter();

                            that.eventEmitter.emit("evt_internal_calllogupdated", that.calllogs);
                            //$rootScope.$broadcast("ON_CALL_LOG_UPDATED");

                            if (num !== oldMissedCallLogCounter) {
                                that.eventEmitter.emit("evt_internal_calllogackupdated", that.calllogs);
                                //$rootScope.$broadcast("ON_CALL_LOG_ACK_UPDATED");
                            }
                        });
                }
            } catch (error) {
                that.logger.log("error", LOG_ID + "(onIqCallLogNotificationReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onIqCallLogNotificationReceived) CATCH Error !!! : ", error);
                return true;
            }
        };
    }

    /**
     * Method isMediaPillarJid
     * @public
     * @param {string} fromJid the from jid
     * @returns {boolean} true if it is the media pillar Jid
     * @memberof WebrtcGatewayService
     */
     isMediaPillarJid(fromJid) {
        let indexMPinJid = -1; // presence&pos of "mp_" in jid
        //no jid provided!
        if (!fromJid) { return false; }
        indexMPinJid = fromJid.search("mp_"); //"mp_" must be at position 0
        return (indexMPinJid === 0);
    }

    removeCallLogsForUser (jid) {
         let that = this;

        if ( jid.endsWith("@_") ) {
            // Ticket 2629 : remove @_ from jid added by server for JIDisation...
            jid = jid.substring(0, jid.length - 2);
        }
        that.logger.log("info", LOG_ID + "removeCallLogsForUser with jid: " + jid);

        let newLogs = [];
        for (let i = 0; i < that.calllogs.callLogs.length; i++) {
            if (!that.calllogs.callLogs[i].contact || (that.calllogs.callLogs[i].contact.jid !== jid && that.calllogs.callLogs[i].contact.id !== jid)) {
                newLogs.push(that.calllogs.callLogs[i]);
            }
        }

        that.calllogs.callLogs = newLogs;

        that.orderCallLogsFunction();

        let oldMissedCallLogCounter = that.calllogs.numberMissedCalls;
        let num = that.getMissedCallLogCounter();

        //$rootScope.$broadcast("ON_CALL_LOG_UPDATED");
        that.eventEmitter.emit("evt_internal_calllogupdated", that.calllogs);

        if (num !== oldMissedCallLogCounter) {
            //$rootScope.$broadcast("ON_CALL_LOG_ACK_UPDATED");
            that.eventEmitter.emit("evt_internal_calllogackupdated", that.calllogs);
        }
    };

    async createCallLogFromMessage(message) {
        let that = this;
        // that.logger.log("info", LOG_ID + "[callLogService] createCallLogFromMessage"); MCO really verbose....
        let defered = new Deferred();

        let messageElem = message;
        let otherParticipantJid = null;
        let otherParticipantNumber = null;
        let direction = "";

        let callid = messageElem.find("call_id");
        let id = callid.text();
        let callerJid = messageElem.find("caller").text();
        let calleeJid = messageElem.find("callee").text();
        let state = messageElem.find("state").text();
        let duration = parseInt(messageElem.find("duration").text(), 10);
        let callSubject = messageElem.find("subject").text();
        let foundidentity = null;
        let identityFirstName = "";
        let identityLastName = "";

        let type = "webrtc";

        if ((callerJid && callerJid.indexOf("janusgateway") !== -1) || (calleeJid && calleeJid.indexOf("janusgateway") !== -1)) {
            that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage ignore janusgateway call-logs");
            return;
        }

        if ((callerJid && this.isMediaPillarJid(callerJid)) || (calleeJid && this.isMediaPillarJid(calleeJid))) {
            that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage ignore janusgateway call-logs");
            return;
        }

        let typeCall = messageElem.find("call_log").attr("type");
        //compatibility with the old method
        if (!typeCall) {
            typeCall = messageElem.find("type").text();
        }

        let read = (messageElem.find("ack").attr("read") === "true");
        let date = messageElem.find("delay").attr("stamp");

        let conference = (messageElem.find("call_log").attr("service") === "conference");

        //check if phonebook search is allowed by profile else no result
        if (that.profileService.isFeatureEnabled(that.profileService.getFeaturesEnum().TELEPHONY_PHONE_BOOK) || config.permitSearchFromPhoneBook) {
            foundidentity = messageElem.find("identity");
        }


        if (duration > 0) {
            duration = moment.duration(duration, "ms").format("h[H] mm[m] ss[s]");
        } else {
            duration = 0;
        }

        if (date) {
            date = new Date(date);
        }

        if (conference) {
            otherParticipantJid = callerJid;
            type = "conference";
            direction = this.contactService.isUserContactJid(callerJid) ? "outgoing" : "incoming";

            if (otherParticipantJid.indexOf("@") === -1) {
                //telephone number
                otherParticipantNumber = otherParticipantJid;
                otherParticipantJid = null;
            }
        } else {

            if (typeCall === "phone") {
                type = "telephone";
            }

            if (this.contactService.isUserContactJid(callerJid)) {
                otherParticipantJid = calleeJid;
                direction = "outgoing";
            } else {
                otherParticipantJid = callerJid;
                direction = "incoming";
            }

            if (otherParticipantJid.indexOf("@") === -1) {
                //telephone number
                otherParticipantNumber = otherParticipantJid;
                otherParticipantJid = null;
                type = "telephone";
            }
        }

        if (otherParticipantJid || otherParticipantNumber) {
            this.contactService.getOrCreateContact(otherParticipantJid, otherParticipantNumber).then((contact) => {
                that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage otherParticipant jid:" + otherParticipantJid + " => contact retrieved (temp:" + contact.temp + ")");
                that.logger.log("internal", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage otherParticipant jid:" + otherParticipantJid + "  Number:" + otherParticipantNumber + " => contact retrieved (temp:" + contact.temp + ")");
                    if (!conference && !otherParticipantJid && contact.temp) { //only in case of temp contact
                        //find Xnames from directories
                        if (foundidentity && foundidentity.length) {
                            let foundFirstName = foundidentity.attr("firstName");
                            let foundLastName = foundidentity.attr("lastName");
                            let foundDisplayName = foundidentity.attr("displayName");
                            identityFirstName = foundFirstName ? foundFirstName : "";
                            identityLastName = foundLastName ? foundLastName : "";
                            if (identityLastName === "" && identityFirstName === "" &&
                                foundDisplayName && foundDisplayName.length !== 0 && foundDisplayName !== otherParticipantNumber) {
                                identityLastName = foundDisplayName; //hack to use displayName instead of lastName (when lastName not available)
                            }
                            if (identityFirstName.length || identityLastName.length) {
                                //update contact
                                that.logger.log("internal", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage  xNames updated from directories for contact " + contact.id);
                                contact.updateName(identityFirstName, identityLastName);
                            }
                        } else { //try to find in outlook
                            // Do not do it in node.
                            /*
                            try {
                                let centralizedService = $injector.get("centralizedService");
                                let reload = true;
                                centralizedService.outlook.updateContactFromOutlookInfos(contact, otherParticipantNumber, reload)
                                    .then(
                                        function successCallback(updateStatus) {
                                            if (updateStatus) {
                                                that.logger.log("debug", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage  xNames updated from outlook for contact " + contact.id);
                                            } else {
                                                that.logger.log("debug", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage no update from outlook for contact :" + contact.id);
                                            }
                                        },
                                        function errorCallback() {
                                            that.logger.log("debug", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage  no Outlook search available");
                                        }
                                    );
                            } catch (error) {
                            }
                            // */
                        }
                        //#29830++
                        //if displayNmane is a phone number (and only for contact.temp)
                        //then use phoneProcan as displayName and display only that in calllog (done in callLogsCell.html)
                        let displayNameisAPhoneNumber = false;
                        let phone_number_regex = /^[0-9A-D #\-\+\*\(\)\./]{1,32}$/;
                        if (that.telephonyService.started) {
                            let matchAsNumber = contact.displayName.match(phone_number_regex);
                            displayNameisAPhoneNumber = matchAsNumber && that.telephonyService.startAsPhoneNumber(contact.displayName);
                        }
                        if (displayNameisAPhoneNumber) {
                            if (contact.phoneProCan && contact.phoneProCan !== "") {
                                contact.displayName = contact.phoneProCan;//use phoneProCan as displayName
                            }
                        }
                        //#29830--
                    }

                    let callLog = CallLog.create(id, contact, state, duration, type, read, date, direction, callSubject);

                    //do not push up duplicates
                    if (!that.logAlreadyExists(callLog) && state !== "failed" && state !== "ongoing") {
                        that.calllogs.callLogs.push(callLog);
                    } else {
                        that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage ignore call log, state: " + state);
                        that.logger.log("internal", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage ignore call log with id: " + id + ", state: " + state);
                    }

                    that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage success");

                    defered.resolve(callLog);
                })
                .catch(function (error) {
                    that.logger.log("error", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage error ");
                    that.logger.log("internalerror", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage error : " + error);
                    defered.resolve();
                });
        } else {
            that.logger.log("info", LOG_ID + "[createCallLogFromMessage] createCallLogFromMessage  No jid or no phoneNumber ");
            defered.resolve();
        }
        return defered.promise;
    }

    logAlreadyExists(log) {
        let that = this;
        let i;
        for (i = 0; i < that.calllogs.callLogs.length; i++) {
            if (that.calllogs.callLogs[i].id === log.id) {
                return true;
            }
        }

        return false;
    }

    orderCallLogsFunction() {
        let that = this;
        that.logger.log("info", LOG_ID + "[orderCallLogsFunction] orderByFunction");
        that.calllogs.orderByNameCallLogsBruts = orderByFilter(that.calllogs.callLogs, CallLog.getNames, false, CallLog.sortByContact);
        that.calllogs.orderByDateCallLogsBruts = orderByFilter(that.calllogs.callLogs, CallLog.getDate, false, CallLog.sortByDate);

        that.calllogs.simplifiedCallLogs = that.simplifyCallLogs(that.calllogs.orderByDateCallLogsBruts);

        that.calllogs.orderByNameCallLogs = that.fusionInformation(that.calllogs.orderByNameCallLogsBruts);
        that.calllogs.orderByDateCallLogs = that.fusionInformation(that.calllogs.orderByDateCallLogsBruts);
        return this.calllogs;
    }

    //get number of non-ack missed calls
    getMissedCallLogCounter() {
        let that = this;
        let num = 0;

        that.calllogs.callLogs.forEach((callLog) => {
            if (!callLog.read && callLog.state === "missed" && callLog.direction === "incoming") {
                num++;
            }
        });

        that.calllogs.numberMissedCalls = num;

        return num;
    }

    //update ACK for call log with ID
    callLogAckUpdate(id) {
        let that = this;
        try {
            that.calllogs.callLogs.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
            that.calllogs.simplifiedCallLogs.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
            that.calllogs.orderByDateCallLogs.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
            that.calllogs.orderByNameCallLogsBruts.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
            that.calllogs.orderByDateCallLogsBruts.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
            that.calllogs.orderByNameCallLogs.forEach(function (callLog) {
                if (callLog.id === id) {
                    callLog.read = true;
                    return;
                }
            });
        } catch (err) {
            that.logger.log("error", LOG_ID + "[callLogAckUpdate] !!! CATCH Error ");
            that.logger.log("internalerror", LOG_ID + "[callLogAckUpdate] !!! CATCH Error : ", err);
        }
    }

    simplifyCallLogs(callLogs) {
        let result = [];

        for (let i = 0; i < callLogs.length; i++) {
            result[i] = {};
            result[i].contact = callLogs[i].contact.id;
            result[i].contactDisplayName = callLogs[i].contact.displayName;
            result[i].contactInitials = callLogs[i].contact.initials;
            result[i].id = callLogs[i].id;
            result[i].state = callLogs[i].state;
            result[i].duration = callLogs[i].duration;
            result[i].direction = callLogs[i].direction;
            result[i].type = callLogs[i].type;
            result[i].read = callLogs[i].read;
            result[i].date = callLogs[i].date;
        }

        return result;
    }

    async resetCallLogs() {
        let that = this;
        that.logger.log("info", LOG_ID + "[resetCallLogs] resetCallLogs");
        that.calllogs = {
            "callLogs": [],
            "orderByNameCallLogs": [],
            "orderByDateCallLogs": [],
            "orderByNameCallLogsBruts": [],
            "orderByDateCallLogsBruts": [],
            "simplifiedCallLogs": [],
            "numberMissedCalls": 0,

            "lastTimestamp": null
        };
    }

    fusionInformation(callLogs) {
        let passed = {};

        let current = 0;

        let fusion = [];

        for (let i = 0; i < callLogs.length; i++) {
            let log = callLogs[i];
            let jid = log.contact.jid;
            if (!log.contact.jid) {
                jid = log.contact.id;
            }

            //if conference log
            if (log.type === "conference") {
                if (i !== 0) {
                    current++;
                }
                fusion[current] = log;
                fusion[current].count = 1;
                fusion[current].editable = false;

                continue;
            }

            //first element
            if (i === 0) {
                passed[jid] = 1;
                fusion[current] = log;
                fusion[current].count = 1;
                fusion[current].editable = true;
                if (log.state === "missed" && log.direction === "incoming") {
                    fusion[current].isMissed = true;
                } else if (log.state === "missed" && log.direction === "outgoing") {
                    fusion[current].isNotAnswered = true;
                }

                continue;
            }

            //if we already have this element
            if (passed[jid]) {
                let index = passed[jid];
                let element = fusion[index - 1];
                if (element.editable) {
                    if (element.isMissed && log.state === "missed" && log.direction === "incoming") {
                        element.count++;
                    } else if (element.isNotAnswered && log.state === "missed" && log.direction === "outgoing") {
                        element.count++;
                    } else {
                        element.editable = false;
                    }
                }
            }

            //new element
            else {
                current++;
                passed[jid] = current + 1;
                fusion[current] = log;
                fusion[current].count = 1;
                fusion[current].editable = true;
                if (log.state === "missed" && log.direction === "incoming") {
                    fusion[current].isMissed = true;
                } else if (log.state === "missed" && log.direction === "outgoing") {
                    fusion[current].isNotAnswered = true;
                }
                continue;
            }

        }
        return fusion;
    }

}

export {CallLogEventHandler};
module.exports.CallLogEventHandler = CallLogEventHandler;
