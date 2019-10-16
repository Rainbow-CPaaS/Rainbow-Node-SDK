"use strict";
import {error} from "winston";

export {};

import * as uuidv4 from 'uuid/v4';
import * as options from "../connection/WebRtc/serverwebrtc";
import {RTCIceCandidate} from "wrtc";

import {setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {WebRtcEventHandler} from '../connection/XMPPServiceHandler/webrtcEventHandler';
//import {WebRtcConnection} from '../connection/WebRtc/webrtcconnection';
//import {setFlagsFromString} from "v8";
import {WebRtcConnectionManager} from "../connection/WebRtc/WebRtcConnectionManager";
import {ConnectionWebRtc} from '../connection/WebRtc/connectionwebrtc';
import {createSDPUtil} from '../connection/WebRtc/SDPUtil.js';

const SDPUtil = createSDPUtil();

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {isStarted} from "../common/Utils";


const LOG_ID = "WEBRTC/SVCE - ";

@isStarted()
/**
* @module
* @name WebRtcService
* @public
* @description
*      This service allow to get the webrtc call manage it. <br><br>
*/
 class WebRtcService {
    public _eventEmitter: any;
    private logger: any;
    private started: boolean;
    private _initialized: boolean;
    private deferedObject: any;
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _profiles: any;
    private _webrtcEventHandler: WebRtcEventHandler;
    private _webrtcHandlerToken: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up: boolean,
        optional: boolean
    };
    public webRtcConnectionManager: WebRtcConnectionManager;
    public connections: Map<any, any> = new Map();
    public  connection:  ConnectionWebRtc;
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }


    // $q, $log, $rootScope, $interval, contactService, xmppService, CallLog, orderByFilter, profileService, $injector, telephonyService, webrtcGatewayService
    constructor(_eventEmitter, logger, _startConfig) {

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this.logger = logger;

        this.started = false;
        this._initialized = false;

        this.ready = false;
        this.deferedObject = null;

        this._eventEmitter.on("evt_internal_InitiateRequest", this.onInitiateRequest.bind(this));
        this._eventEmitter.on("evt_internal_TransportInfoRequest", this.onTransportInfoRequest.bind(this));
        this._eventEmitter.on("evt_internal_TerminateRequest", this.onTerminateRequest.bind(this));


    }

    async start(_xmpp: XMPPService, _rest: RESTService, _profiles) {
        let that = this;
        that._xmpp = _xmpp;
        that._rest = _rest;
        that._profiles = _profiles;

        this._webrtcHandlerToken = [];

        that.logger.log("info", LOG_ID + " ");
        that.logger.log("info", LOG_ID + "[start] === STARTING ===");
        this.attachHandlers();
        this.ready = true;
    }

    async stop() {
        let that = this;

        that.logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this.started = false;
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;
        that._profiles = null;

        delete that._webrtcEventHandler;
        that._webrtcEventHandler = null;
        that._webrtcHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        that._webrtcHandlerToken = [];
        this.ready = false;

        that.logger.log("info", LOG_ID + "[stop] Stopped");
    }

    public createId() {
        do {
            const id = uuidv4();
            if (!this.connections.has(id)) {
                return id;
            }
            // eslint-disable-next-line
        } while (true);
    }

    async init() {
        let that = this;

        await setTimeoutPromised(3000).then(async () => {
            let startDate = new Date();

            //this.webrtcConnection = new WebRtcConnection(that.createId(), options);

            that.webRtcConnectionManager = await WebRtcConnectionManager.create(options);

//            that.getCallLogHistoryPage()
  //              .then(() => {
                    // @ts-ignore
                    let duration = new Date() - startDate;
                    let startDuration = Math.round(duration);
                    that.logger.log("info", LOG_ID + " WebRtcConnection start duration : ", startDuration);
                    that.logger.log("info", LOG_ID + "[start] === STARTED (" + startDuration + " ms) ===");
                    that.started = true;
    //            })
      //          .catch(() => {
    //                that.logger.log("error", LOG_ID + "[start] === STARTING FAILURE ===");
     //           });
        });

    }

    attachHandlers() {
        let that = this;

        that.logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._webrtcEventHandler = new WebRtcEventHandler(that._xmpp, that, that._profiles);
        that._webrtcHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._webrtcEventHandler.MESSAGE, that._webrtcEventHandler.onMessageReceived.bind(that._webrtcEventHandler)),
            PubSub.subscribe(that._xmpp.hash + "." + that._webrtcEventHandler.IQ_SET, that._webrtcEventHandler.onSetStanza.bind(that._webrtcEventHandler)),
        ];

    }

    async  onInitiateRequest(result): Promise<void> {
        let that = this;
        that.logger.log("internal", LOG_ID + "[onInitiateRequest] result : ", result);
        //that.webrtcConnection.doOffert();

        result.sdp = result.SDP;
        result.type = "offer";

        let conn = await that.webRtcConnectionManager.getConnection(that.connection.id);
        that.logger.log("internal", LOG_ID + "[onInitiateRequest] conn : ", conn);
        await conn.applyAnswer(result).then(async r => {
            that.logger.log("internal", LOG_ID + "[onInitiateRequest] applyAnswer r : ", r);
            await conn.createAnswer();
            let id = that._xmpp.xmppUtils.getUniqueMessageId();
            that.logger.log("debug", LOG_ID + "[onInitiateRequest] will sessionRinging.");
            let stanzaSessionRinging = result.sessionJingle.sessionRinging(id);
            that.logger.log("internal", LOG_ID + "[onInitiateRequest] will sessionRinging stanzaSessionRinging : ", stanzaSessionRinging);
            await that._xmpp.sendStanza(stanzaSessionRinging);

            //await this.xmppService.xmppClient.send(stanzaSessionRinging);

            /* let stanzaAccept = await result.sessionJingle.accept(conn.peerConnection);
            await that._xmpp.sendStanza(stanzaAccept); // */
            /*
            let callId, bareto;
            await that._xmpp.proceedProposition(callId, bareto);
            // */
        }).catch(err => {
            that.logger.log("internalerror", LOG_ID + "[onInitiateRequest] Error while applyAnswer r : ", err);
        });

       // */
    }

    async  onTransportInfoRequest(result): Promise<void> {
        let that = this;
        that.logger.log("internal", LOG_ID + "[onTransportInfoRequest] result : ", result);
        if ( !result.candidates[0]) {
            return new Promise((resolve, reject) =>
            {
                resolve();
            });
        }
        this.logger.log("info", LOG_ID +'(onTransportInfoRequest) candidate : ', result.candidates[0].candidate);
        let conn = await that.webRtcConnectionManager.getConnection(that.connection.id);
        //let cdte :any = {candidate: result.candidates[0].candidate.slice(2)};

        let cdte = SDPUtil.parse_icecandidate( result.candidates[0].candidate.slice(2));
        cdte.candidate = result.candidates[0].candidate.slice(2);
        //cdte.foundation = Number(cdte.candidate.split(" ")[0].split(":")[1]);
        //cdte["sdpMid"] = "0";
        //cdte["sdpMLineIndex"] = 0;
        /*cdte["sdpMid"] = null;
        cdte["sdpMLineIndex"] = 0;
        cdte["relatedAddress"] = cdte["rel-addr"];
        cdte["relatedPort"] = cdte["rel-port"];
         */
        /*'candidate',
            'sdpMid',
            'sdpMLineIndex',
            'foundation',
            'component',
            'priority',
            'address',
            'protocol',
            'port',
            'type',
            'tcpType',
            'relatedAddress',
            'relatedPort',
            'usernameFragment' // */

        this.logger.log("info", LOG_ID +'(onTransportInfoRequest) received cdte : ', cdte);

        /*let candidateSplited = cdte.candidate.split(" ");
        cdte.sdpMid = "0";
        cdte.sdpMLineIndex = 0;
        cdte.foundation = cdte.candidate.split(":")[1];
        cdte.protocol = candidateSplited[2];
        cdte.priority = candidateSplited[3];
        cdte.address = candidateSplited[4];
        cdte.port = candidateSplited[5];
        cdte.type = candidateSplited[7];
         */

        /* succeed exchange in node-webrtc-sample: {
            "candidate": "candidate:1998826949 1 udp 2122260223 135.118.230.33 58166 typ host generation 0 ufrag KmzI network-id 1",
            "sdpMid": "0",
            "sdpMLineIndex": 0,
            "foundation": "1998826949",
            "component": "rtp",
            "priority": 2122260223,
            "address": "135.118.230.33",
            "protocol": "udp",
            "port": 58166,
            "type": "host",
            "tcpType": null,
            "relatedAddress": null,
            "relatedPort": null,
            "usernameFragment": "KmzI"
        }

         // */

        // candidate:3148780118 1 udp 1685987071 165.225.77.40 6072 typ srflx raddr 135.118.230.33 rport 64938 generation 0

        //this.logger.log("info", LOG_ID +'(onTransportInfoRequest) cdte : ', cdte);

        cdte =  {
            "candidate": "candidate:1998826949 1 udp 2122260223 135.118.230.33 58166 typ host generation 0 ufrag KmzI network-id 1",
            "sdpMid": "0",
            "sdpMLineIndex": 0,
            "foundation": "1998826949",
            "component": "rtp",
            "priority": 2122260223,
            "address": "135.118.230.33",
            "protocol": "udp",
            "port": 58166,
            "type": "host",
            "tcpType": null,
            "relatedAddress": null,
            "relatedPort": null,
            "usernameFragment": "KmzI"
        } ;

        this.logger.log("info", LOG_ID +'(onTransportInfoRequest) fake cdte : ', cdte);

        let candidate = new RTCIceCandidate(cdte);
        conn.addIceCandidate(candidate).then(r => {
            that.logger.log("internal", LOG_ID + "[onTransportInfoRequest] addIceCandidate result : ", r);
        });
    }


    async  onTerminateRequest(result): Promise<void> {
        let that = this;
        that.logger.log("internal", LOG_ID + "[onTerminateRequest] result : ", result);

        //await that.xmppService.setPresence("dnd","audio");
        //await that._xmpp.setPresence("online", "");
        await that._xmpp.setPresence("", "");

        // */
    }

    async createConnection() {
        let that = this;
        that.logger.log("internal", LOG_ID + "[createConnection] _entering_" );
        that.connection = await that.webRtcConnectionManager.createIncallConnection();
        that.logger.log("internal", LOG_ID + "[createConnection] create the web rtc connection : ", that.connection);
        that.logger.log("internal", LOG_ID + "[createConnection] _exiting_" );
        return that.connection;
    }
}

module.exports.WebRtcService = WebRtcService;
export {WebRtcService};
