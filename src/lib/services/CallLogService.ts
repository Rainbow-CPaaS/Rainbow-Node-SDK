"use strict";
import {accessSync} from "fs";

/// <reference path="rainbow-sdk-node.d.ts"/>


export {};

//const ErrorCase = require("../common/ErrorManager");
const utils = require("../common/Utils");
const PubSub = require("pubsub-js");

    /*"$q",
    "$log",
    "$rootScope",
    "$interval",
    "contactService",
    "xmppService",
    "CallLog",
    "orderByFilter",
    "profileService",
    "$injector",
    "telephonyService",
    "webrtcGatewayService",
    // */
const LOG_ID = "CALLLOG/SVCE - ";

import {CallLogEventHandler} from '../connection/XMPPServiceHandler/calllogEventHandler';
import {setFlagsFromString} from "v8";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

interface ICallLogsBean {
    callLogs: Array<any>;
    orderByNameCallLogs: Array<any>;
    orderByDateCallLogs: Array<any>,
    orderByNameCallLogsBruts: Array<any>,
    orderByDateCallLogsBruts: Array<any>,
    simplifiedCallLogs: Array<any>,
    numberMissedCalls: number,
    lastTimestamp: number
}

function CallLogsBean() : ICallLogsBean {
    return {
        "callLogs": [],
        "orderByNameCallLogs": [],
        "orderByDateCallLogs": [],
        "orderByNameCallLogsBruts": [],
        "orderByDateCallLogsBruts": [],
        "simplifiedCallLogs": [],
        "numberMissedCalls": 0,
        "lastTimestamp": 0
    };
}
    class CallLogService {
        public _eventEmitter: any;
        private logger: any;
        private started: boolean;
        private _initialized: boolean;
        private calllogs: ICallLogsBean;
        private callLogHandlerRef: any;
        private callLogMessageAckRef: any;
        private callLogNotificationRef: any;
        private callLogsHistory: any;
        private telephonyCallLog: any;
        private telephonyCallLogHistory: any;
        private deferedObject: any;
        private callLogComplete: any;
        private callLogIndex: any;
        private calllogHandlerToken: any;
        /*private callLogs: any;
        private callLogsPromises: any;
        private orderByNameCallLogs: any;
        private orderByDateCallLogs: any;
        private orderByDateCallLogsBruts: any;
        private simplifiedCallLogs: any;
        private numberMissedCalls: any;
        private lastTimestamp: any;
        // */
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _contacts: any;
    private _profiles: any;
    private _calllogEventHandler: CallLogEventHandler;
        _telephony: any;

        // $q, $log, $rootScope, $interval, contactService, xmppService, CallLog, orderByFilter, profileService, $injector, telephonyService, webrtcGatewayService
    constructor(_eventEmitter, logger) {

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this.logger = logger;

        this.started = false;
        this._initialized = false;


        /*this.callLogs = [];
        this.orderByNameCallLogs = [];
        this.orderByDateCallLogs = [];
        this.orderByDateCallLogsBruts = [];
        this.simplifiedCallLogs = []; // */

        this.calllogs = CallLogsBean();


        this.callLogHandlerRef = null;
        this.callLogMessageAckRef = null;
        this.callLogNotificationRef = null;

//        this.numberMissedCalls = 0;
//        this.lastTimestamp = null;

        this.callLogsHistory = [];
        this.telephonyCallLog = {};
        this.telephonyCallLogHistory = {};

        this.deferedObject = null;
        this.callLogComplete = false;
        this.callLogIndex = -1;

        this._eventEmitter.on("rainbow_calllogupdated", this.onCallLogUpdated.bind(this));
        this._eventEmitter.on("rainbow_calllogackupdated", this.onCallLogAckReceived.bind(this));

    }

    async start(_xmpp : XMPPService, _rest : RESTService, _contacts , _profiles, _telephony) {
        let that = this;
        that._xmpp = _xmpp;
        that._rest = _rest;
        that._contacts = _contacts;
        that._profiles = _profiles;
        that._telephony = _telephony;

        this.calllogHandlerToken = [];

        that.logger.log("info", LOG_ID + " ");
        that.logger.log("info", LOG_ID + "[start] === STARTING ===");
        this.attachHandlers();
    }

    async stop() {
        let that = this;

        that.logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this.started = false;
        this._initialized = false;
        //this.callLogs = [];
        //this.callLogsPromises = [];

        this.callLogHandlerRef = null;
        this.callLogMessageAckRef = null;
        this.calllogs = CallLogsBean();

        this.telephonyCallLog = {};
        this.telephonyCallLogHistory = {};

        this.callLogComplete = false;
        this.callLogIndex = -1;

        this.callLogsHistory = [];

        that._xmpp = null;
        that._rest = null;
        that._contacts = null;
        that._profiles = null;

        delete that._calllogEventHandler;
        that._calllogEventHandler = null;
        that.calllogHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        that.calllogHandlerToken = [];

        that.logger.log("info", LOG_ID + "[stop] Stopped");
    }

    async init () {
        let that = this;

        //that._eventEmitter.on("rainbow_oncalllogupdated", that.onIqCallLogNotificationReceived.bind(that));
        await utils.setTimeoutPromised(3000).then(() => {
            let startDate = new Date();
            that.getCallLogHistoryPage()
                .then(() => {
                    // @ts-ignore
                    let duration = new Date() - startDate;
                    let startDuration = Math.round(duration);
                    that.logger.log("info", LOG_ID + " callLogService start duration : ",  startDuration);
                    that.logger.log("info", LOG_ID + "[start] === STARTED (" + startDuration + " ms) ===");
                    that.started = true;
                })
                .catch(() => {
                    that.logger.log("error", LOG_ID + "[start] === STARTING FAILURE ===");
                });
        });

    }

    attachHandlers() {
        let that = this;

        that.logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._calllogEventHandler = new CallLogEventHandler(that._xmpp, that, that._contacts, that._profiles, that._telephony);
        that.calllogHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._calllogEventHandler.IQ_CALLLOG, that._calllogEventHandler.onIqCallLogReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._calllogEventHandler.CALLLOG_ACK, that._calllogEventHandler.onCallLogAckReceived ),
            PubSub.subscribe( that._xmpp.hash + "." + that._calllogEventHandler.IQ_CALLOG_NOTIFICATION, that._calllogEventHandler.onIqCallLogNotificationReceived )
        ];

        /*
        //if reconnection, update the call-logs
        if (that.started && that.lastTimestamp) {
            $interval(function () {
                that.getCallLogHistoryPage(that.lastTimestamp);
            }, 1000, 1, true);
        }
        // */
    }




    /*********************************************************/
    /**       MAM REQUESTS                                  **/
    /*********************************************************/

    async getCallLogHistoryPage(useAfter?) {
        let that = this;

        that.logger.log("info", LOG_ID + "[getCallLogHistoryPage] getCallLogHistoryPage");
        return await that._xmpp.sendGetCallLogHistoryPage(useAfter);
    }

    /*********************************************************/
    /**                     API                             **/
    /*********************************************************/

    /**
     * @public
     * @method getAll
     * @instance
     * @description
     *    Get all calls log history for the connected user
     * @return {CallLog[]} An array of call log entry
     */
    getAll() {
        let that = this;

        that.calllogs = this._calllogEventHandler.orderCallLogsFunction();
        let callLogs = that.getSimplifiedCallLogs();

        // as duration is "h[H] mm[m] ss[s]" in rb, switch it back to ms ...
        for (let i = 0; i < callLogs.length; i++) {
            let durationMs = 0;
            let hmmss = callLogs[i].duration;
            if ( hmmss && (typeof hmmss === "string") && hmmss.match( /^(?:(?:([01]?\d|2[0-3])h )?([0-5]?\d)m )?([0-5]?\ds)$/ ) ) {
                // Remove h, m and s
                hmmss = hmmss.replace( /[hms]/g , "");
                // split it at the "space", also reverse it to get seconds then minutes then hours
                let parts = hmmss.split(' ').reverse();

                for( let j = 0; j < parts.length; j++) {
                    durationMs += parts[j] * Math.pow(60, j);
                }
                callLogs[i].duration = durationMs * 1000;
            }
        }
        return callLogs;
    }

    /**
     * @public
     * @method getMissedCallLogCounter
     * @instance
     * @description
     *    Get the number of call missed (state === "missed" && direction === "incoming")
     * @return {Number} The number of call missed
     */
    getMissedCallLogCounter() {
        let that = this;
        let num = 0;

        that.calllogs.callLogs.forEach(function(callLog) {
            if (!callLog.read && callLog.state === "missed" && callLog.direction === "incoming") {
                num++;
            }
        });

        return num;
    };


    /**
     * @public
     * @method deleteOneCallLog
     * @instance
     * @description
     *    Delete a call log from it's id<br/>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished
     * @param {String} id The call log id to remove
     * @return Nothing
     */
    deleteOneCallLog(id) {
        let that = this;

        that.logger.log("info", LOG_ID + "[deleteOneCallLog] deleteOneCallLog " + id);
        that._xmpp.deleteOneCallLog(id);
    }

    /**
     * @public
     * @method deleteCallLogsForContact
     * @instance
     * @description
     *    Delete all calls log items associated to a contact's given jid<br/>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished
     * @param {String} jid The call log id to remove
     * @return Nothing
     */
    deleteCallLogsForContact(jid) {
        let that = this;

        that.logger.log("info", LOG_ID + "[deleteCallLogsForContact] deleteCallLogsForContact " + jid);
        that._xmpp.deleteCallLogsForContact(jid);
    }

    /**
     * @public
     * @method deleteAllCallLogs
     * @instance
     * @description
     *    Delete all call logs history<br/>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished
     * @return Nothing
     */
    deleteAllCallLogs() {
        let that = this;

        that.logger.log("info", LOG_ID + "[deleteAllCallLogs] deleteAllCallLogs");
        that._xmpp.deleteAllCallLogs();
    }

    /**
     * @public
     * @method markCallLogAsRead
     * @instance
     * @description
     *    Mark a call log item as read<br/>
     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished
     * @param {String} id The call log id
     * @return Nothing
     */
    markCallLogAsRead(id) {
        let that = this;

        that.logger.log("info", LOG_ID + "[markCallLogAsRead] markCallLogAsRead " + id);
        that._xmpp.markCallLogAsRead(id);
    }

    /**
     * @public
     * @method markAllCallsLogsAsRead
     * @instance
     * @description
     *    Mark all call log items as read<br/>
     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished
     * @return Nothing
     */
    async markAllCallsLogsAsRead() {
        let that = this;

        that.logger.log("info", LOG_ID + "[markAllCallsLogsAsRead] markAllCallsLogsAsRead ");
        await that._xmpp.markAllCallsLogsAsRead(that.calllogs.callLogs);
    }

    /**
     * @public
     * @method isInitialized
     * @instance
     * @description
     *    Check if the call log history has been received from Rainbow
     *    A false answer means that the call logs have not yet been retrieved from the server.
     * @return {Boolean} True if the call logs have been retrieved. False elsewhere.
     */
    isInitialized() {
        return this._initialized;
    }

    /*********************************************************/
    /**                  EVENT HANDLERS                     **/
    /*********************************************************/

    async onCallLogUpdated(calllogs) {
        this.calllogs = calllogs ;
        this._initialized = true;
    }

    async onCallLogAckReceived(calllogs) {
        this.calllogs = calllogs ;
        this._initialized = true;
    }

    /*async onIqCallLogNotificationReceived(calllogs) {
        this.calllogs = calllogs ;
    } // */


    /*********************************************************/
    /**                  HELPER FUNCTIONS                   **/
    /*********************************************************/

    getOrderByNameCallLogs() {
        let that = this;
        return that.calllogs.orderByNameCallLogs;
    }

    getOrderByDateCallLogs() {
        let that = this;
        if (that.calllogs.orderByDateCallLogs.length !== 0) {
            that.calllogs.orderByDateCallLogs[0].isLatestCall = true; //update the latest callLog to show its subject next to the contact name.
            if (that.calllogs.orderByDateCallLogs[1]) {
                that.calllogs.orderByDateCallLogs[1].isLatestCall = false;
            }
        }
        return that.calllogs.orderByDateCallLogs;
    }


    getOrderByNameCallLogsBruts() {
        let that = this;
        return that.calllogs.orderByNameCallLogsBruts;
    }

    getOrderByDateCallLogsBruts() {
        let that = this;
        return that.calllogs.orderByDateCallLogsBruts;
    }

    //call logs where the contact is replaced by his JID or telephone number
    getSimplifiedCallLogs() {
        let that = this;
        return that.calllogs.simplifiedCallLogs;
    }

    getNumberMissedCalls() {
        let that = this;
        return that.calllogs.numberMissedCalls;
    }

    async resetCallLogs() {
        let that = this;
        that.logger.log("info", LOG_ID + "[resetCallLogs] resetCallLogs");
        that.calllogs = CallLogsBean();
        await this._calllogEventHandler.resetCallLogs();

        await that.getCallLogHistoryPage();
    }

}

module.exports = CallLogService;