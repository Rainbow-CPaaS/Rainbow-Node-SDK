"use strict";

import {GenericService} from "./GenericService";

export {};

import {isDefined, logEntryExit, setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {CallLogEventHandler} from '../connection/XMPPServiceHandler/calllogEventHandler';
//import {setFlagsFromString} from "v8";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {EventEmitter} from "events";
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {TelephonyService} from "./TelephonyService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {error} from "winston";

const LOG_ID = "CALLLOG/SVCE - ";
const API_ID = "API_CALL - ";

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

@logEntryExit(LOG_ID)
@isStarted([])
/**
* @module
* @name CallLogService
 * @version SDKVERSION
* @public
* @description
*      This service allow to get the call log and manage it. <br><br>
*      The main methods and events proposed in that service allow to: <br>
*      - Get all calls log <br>
*      - Delete one or all calls log <br>
*      - Mark calls as read / unread <br>
*/
 class CallLogService extends GenericService{
    get calllogEventHandler(): CallLogEventHandler {
        return this._calllogEventHandler;
    }
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
    private _contacts: ContactsService;
    private _profiles: ProfilesService;
    private _calllogEventHandler: CallLogEventHandler;
    private _telephony: TelephonyService;
    private iMOptions: any;

    static getClassName(){ return 'CallLogService'; }
    getClassName(){ return CallLogService.getClassName(); }

    static getAccessorName(){ return 'calllog'; }
    getAccessorName(){ return CallLogService.getAccessorName(); }

    // $q, $log, $rootScope, $interval, contactService, xmppService, CallLog, orderByFilter, profileService, $injector, telephonyService, webrtcGatewayService
    constructor(_core:Core, _eventEmitter : EventEmitter, logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(logger, LOG_ID);
        this.setLogLevels(this);

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this._logger = logger;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;

        this._core = _core;

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

        this._eventEmitter.on("evt_internal_calllogupdated", this.onCallLogUpdated.bind(this));
        this._eventEmitter.on("evt_internal_calllogackupdated", this.onCallLogAckReceived.bind(this));

    }

    async start(_options) { //  _xmpp: XMPPService, _s2s : S2SService, _rest: RESTService, _contacts : ContactsService, _profiles : ProfilesService, _telephony : TelephonyService
        let that = this;
        that.initStartDate();
        that._xmpp = that._core._xmpp;
        that._rest = that._core._rest;
        that._contacts = that._core.contacts;
        that._profiles = that._core.profiles;
        that._telephony = that._core.telephony;
        that._options = _options;
        that._s2s = that._core._s2s;
        that._useXMPP = that._options.useXMPP;
        that._useS2S = that._options.useS2S;

        that.iMOptions = _options?._getIMOptions();

        this.calllogHandlerToken = [];

       that._logger.log(that.INFO, LOG_ID + " ");
       that._logger.log(that.INFO, LOG_ID + "[start] === STARTING ===");
        this.attachHandlers();
        that.setStarted ();
    }

    async stop() {
        let that = this;

       that._logger.log(that.INFO, LOG_ID + "[stop] Stopping");

        //remove all saved call logs
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
        if (that.calllogHandlerToken) {
            that.calllogHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        }
        that.calllogHandlerToken = [];
        that.setStopped ();
       that._logger.log(that.INFO, LOG_ID + "[stop] Stopped");
    }

    public async init(useRestAtStartup : boolean) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "(init)");

        if (useRestAtStartup && that.iMOptions.autoLoadCallLog) {
            //that._eventEmitter.on("rainbow_oncalllogupdated", that.onIqCallLogNotificationReceived.bind(that));
            await setTimeoutPromised(3000).then(async () => {
                let startDate = new Date();
                await that.getCallLogHistoryPage()
                        .then(() => {
                            that.setInitialized();
                        })
                        .catch((error) => {
                            that._logger.log(that.ERROR, LOG_ID + "[start] === STARTING FAILURE ===");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "[start] === STARTING FAILURE === : ", error);
                            that.setInitialized();
                        });
            });
        } else {
            that.setInitialized();
        }
    }

    attachHandlers() {
        let that = this;

       that._logger.log(that.INFO, LOG_ID + "(attachHandlers)");

        that._calllogEventHandler = new CallLogEventHandler(that._xmpp, that, that._contacts, that._profiles, that._telephony);
        that.calllogHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._calllogEventHandler.MESSAGE, that._calllogEventHandler.onMessageReceived.bind(that._calllogEventHandler)),
            //PubSub.subscribe(that._xmpp.hash + "." + that._calllogEventHandler.IQ_CALLLOG, that._calllogEventHandler.onIqCallLogReceived.bind(that._calllogEventHandler)),
            //PubSub.subscribe(that._xmpp.hash + "." + that._calllogEventHandler.CALLLOG_ACK, that._calllogEventHandler.onCallLogAckReceived.bind(that._calllogEventHandler)),
            //PubSub.subscribe(that._xmpp.hash + "." + that._calllogEventHandler.IQ_CALLOG_NOTIFICATION, that._calllogEventHandler.onIqCallLogNotificationReceived.bind(that._calllogEventHandler))
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

       that._logger.log(that.INFO, LOG_ID + "(getCallLogHistoryPage)");
        if (that._useXMPP) {
            return await that._xmpp.sendGetCallLogHistoryPage(useAfter);
        }
        if (that._useS2S) {
            return Promise.resolve(undefined);
        }
    }

    /*********************************************************/
    /**                     API                             **/

    /*********************************************************/

    //region CallLog MANAGEMENT
    
    /**
     * @public
     * @nodered true
     * @method getAll
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Get all calls log history for the connected user <br>
     * @return {CallLog[]} An array of call log entry
     */
    getAll() {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAll) .");

        that.calllogs = this._calllogEventHandler.orderCallLogsFunction();
        let callLogs = that.getSimplifiedCallLogs();

        // as duration is "h[H] mm[m] ss[s]" in rb, switch it back to ms ...
        for (let i = 0; i < callLogs.length; i++) {
            let durationMs : any = 0;
            let hmmss = callLogs[i].duration;
            if (hmmss && (typeof hmmss === "string") && hmmss.match(/^(?:(?:([01]?\d|2[0-3])h )?([0-5]?\d)m )?([0-5]?\ds)$/)) {
                // Remove h, m and s
                hmmss = hmmss.replace(/[hms]/g, "");
                // split it at the "space", also reverse it to get seconds then minutes then hours
                let parts = hmmss.split(' ').reverse();

                for (let j = 0; j < parts.length; j++) {
                    durationMs += parts[j] * Math.pow(60, j);
                }
                callLogs[i].duration = durationMs * 1000;
            }
        }
        return callLogs;
    }

    /**
     * @public
     * @nodered true
     * @method getMissedCallLogCounter
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Get the number of call missed (state === "missed" && direction === "incoming") <br>
     * @return {Number} The number of call missed
     */
    getMissedCallLogCounter() {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getMissedCallLogCounter) .");
        let num = 0;

        that.calllogs.callLogs.forEach(function (callLog) {
            if (!callLog.read && callLog.state === "missed" && callLog.direction === "incoming") {
               that._logger.log(that.INFO, LOG_ID + "(getMissedCallLogCounter) iter : " , num, ", callLog : ", callLog);
                num++;
            }
        });

        return num;
    };


    /**
     * @public
     * @nodered true
     * @method deleteOneCallLog
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Delete a call log from it's id<br>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
     * @param {string} id The call log id to remove
     * @return Nothing
     */
    deleteOneCallLog(id) {
        let that = this;

       that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteOneCallLog) id : ", id);
        return that._xmpp.deleteOneCallLog(id);
    }

    /**
     * @public
     * @nodered true
     * @method deleteCallLogsForContact
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Delete all calls log items associated to a contact's given jid<br>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
     * @param {string} jid The call log id to remove
     * @return Nothing
     */
    deleteCallLogsForContact(jid) {
        let that = this;

       that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteCallLogsForContact) jid : ", jid);
        return that._xmpp.deleteCallLogsForContact(jid);
    }

    /**
     * @public
     * @nodered true
     * @method deleteAllCallLogs
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Delete all call logs history<br>
     *    You have to listen to event `rainbow_oncalllogupdated` to know when the action is finished <br>
     * @return Nothing
     */
    deleteAllCallLogs() {
        let that = this;

       that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteAllCallLogs)");
        return that._xmpp.deleteAllCallLogs();
    }

    /**
     * @public
     * @nodered true
     * @method markCallLogAsRead
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Mark a call log item as read<br>
     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br>
     * @param {string} id The call log id
     * @return Nothing
     */
    markCallLogAsRead(id) {
        let that = this;

       that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(markCallLogAsRead) id : ", id);
        return that._xmpp.markCallLogAsRead(id);
    }

    /**
     * @public
     * @nodered true
     * @method markAllCallsLogsAsRead
     * @instance
     * @category CallLog MANAGEMENT
     * @description
     *    Mark all call log items as read<br>
     *    You have to listen to event `rainbow_oncalllogackupdated` to know when the action is finished <br>
     * @return Nothing
     */
    async markAllCallsLogsAsRead() {
        let that = this;

       that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(markAllCallsLogsAsRead) .");
       that._logger.log(that.INTERNAL, LOG_ID + "(markAllCallsLogsAsRead) that.calllogs.callLogs : ", that.calllogs.callLogs);
        await that._xmpp.markAllCallsLogsAsRead(that.calllogs.callLogs);
    }
    //endregion CallLog MANAGEMENT
    
    //region CallLog INITIALISATION

    /**
     * @public
     * @nodered true
     * @method isInitialized
     * @instance
     * @category CallLog INITIALISATION
     * @description
     *    Check if the call log history has been received from Rainbow <br>
     *    A false answer means that the call logs have not yet been retrieved from the server. <br>
     * @return {Boolean} True if the call logs have been retrieved. False elsewhere.
     */
    isInitialized() {
        return this._initialized;
    }

    //endregion CallLog INITIALISATION

    //region EVENT HANDLERS

    async onCallLogUpdated(calllogs) {
        this.calllogs = calllogs;
        this._initialized = true;
    }

    async onCallLogAckReceived(calllogs) {
        this.calllogs = calllogs;
        this._initialized = true;
    }

    /*async onIqCallLogNotificationReceived(calllogs) {
        this.calllogs = calllogs ;
    } // */

    //endregion EVENT HANDLERS

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
       that._logger.log(that.INFO, LOG_ID + "[resetCallLogs] resetCallLogs");
        that.calllogs = CallLogsBean();
        await this._calllogEventHandler.resetCallLogs();

        await that.getCallLogHistoryPage();
    }

}

module.exports.CallLogService = CallLogService;
export {CallLogService};
