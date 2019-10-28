"use strict";
import {config, error} from "winston";

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
import {RTCPeerConnection as DefaultRTCPeerConnection} from "wrtc";

const SDPUtil = createSDPUtil();

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {isStarted} from "../common/Utils";
import {AsyncResource} from "async_hooks";


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
    public connection:  ConnectionWebRtc;
    public pc1 ;//= new DefaultRTCPeerConnection();
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }


    // $q, $log, $rootScope, $interval, contactService, xmppService, CallLog, orderByFilter, profileService, $injector, telephonyService, webrtcGatewayService
    constructor(_eventEmitter, logger, _startConfig) {

        let self = this;
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
            let iceServers = await that._rest.getIceConfig();
            that.logger.log("info", LOG_ID + " (WebRtcConnection) iceServers : ", iceServers);

            that.webRtcConnectionManager = await WebRtcConnectionManager.create({iceServers,...options});


           // await that.testconnection();

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

        let offer = {
            "type": "offer",
            "sdp": result.SDP
        };
        // */

        offer = { type: 'offer',
            sdp:
                'v=0\r\no=- 1203703723252593969 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE audio data\r\na=msid-semantic: WMS 3d370734-f960-4bed-96e4-a37607f3b005\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 102 0 8 106 105 13 110 112 113 126\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:rCMw\r\na=ice-pwd:CZwOhfqoL8yWd0kTvsWYdGWU\r\na=ice-options:trickle\r\na=fingerprint:sha-256 D3:CC:3A:DC:73:3A:DA:9D:D0:F1:3A:9E:2A:0F:36:E2:9B:55:4F:19:B1:19:6E:0C:B5:C4:B2:50:D6:16:A4:2B\r\na=setup:actpass\r\na=mid:audio\r\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\na=extmap:2 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=rtpmap:103 ISAC/16000\r\na=rtpmap:104 ISAC/32000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:102 ILBC/8000\r\na=rtpmap:0 PCMU/8000\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:106 CN/32000\r\na=rtpmap:105 CN/16000\r\na=rtpmap:13 CN/8000\r\na=rtpmap:110 telephone-event/48000\r\na=rtpmap:112 telephone-event/32000\r\na=rtpmap:113 telephone-event/16000\r\na=rtpmap:126 telephone-event/8000\r\na=ssrc:1013980281 cname:w+Sj5nqmNK22vtoa\r\na=ssrc:1013980281 msid:3d370734-f960-4bed-96e4-a37607f3b005 2fa31ea8-c377-451f-9df1-49e4fb2e9890\r\na=ssrc:1013980281 mslabel:3d370734-f960-4bed-96e4-a37607f3b005\r\na=ssrc:1013980281 label:2fa31ea8-c377-451f-9df1-49e4fb2e9890\r\nm=application 9 DTLS/SCTP 5000\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:rCMw\r\na=ice-pwd:CZwOhfqoL8yWd0kTvsWYdGWU\r\na=ice-options:trickle\r\na=fingerprint:sha-256 D3:CC:3A:DC:73:3A:DA:9D:D0:F1:3A:9E:2A:0F:36:E2:9B:55:4F:19:B1:19:6E:0C:B5:C4:B2:50:D6:16:A4:2B\r\na=setup:actpass\r\na=mid:data\r\na=sctpmap:5000 webrtc-datachannel 1024\r\n' };

        //result.sdp = 'v=0\r\no=- 4086647801925252121 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=application 9 DTLS/SCTP 5000\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:zIR9\r\na=ice-pwd:9efDTGuIpHj0L0Y3No0rfdp1\r\na=ice-options:trickle\r\na=fingerprint:sha-256 9C:E5:A7:73:43:EC:15:AA:0C:4F:5A:FC:D4:E8:3E:0E:D0:07:C2:B6:43:4C:A2:A4:93:97:95:44:02:C9:56:7F\r\na=setup:actpass\r\na=mid:0\r\na=sctpmap:5000 webrtc-datachannel 1024\r\n';


        that.pc1.createOffer().then(d => {
            console.log("d : ", d);
            let sldd =  that.pc1.setLocalDescription(d);
            console.log(" 1 pc1.signalingState : ", that.pc1.signalingState, ", iceConnectionState : ", that.pc1.iceConnectionState);
            return sldd;
        })
            .then(() =>{
                console.log(" 2 pc1.localDescription : ", that.pc1.localDescription,  ", pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                //let pld =  that.connection.setRemoteDescription(that.pc1.localDescription);
                let pld = that.connection.applyOffer(that.pc1.localDescription);
                console.log(" 3 pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                return pld;
            })
            .then(() => {
                console.log(" 4 pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                let ca = that.connection.createAnswer();
                console.log(" 5 pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                return ca;
            }).then(d => {
             /*console.log(" 6 pc1.signalingState : ", that.pc1.signalingState, ", iceConnectionState : ", that.pc1.iceConnectionState);
             let sld =  that.connection.setLocalDescription(d);
             console.log(" 7 pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.pc2.iceConnectionState);
             return sld; // */
            return d;
        })
            .then(() => {
                console.log(" 8 pc2.localDescription : ", that.connection.localDescription,  ", pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
/*
                let sld2 = pc1.setRemoteDescription(pc2.localDescription);
                console.log(" 9 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return sld2;
*/
            })
            .then(() => {
                console.log("pc1.canTrickleIceCandidates : ", that.pc1.canTrickleIceCandidates,  ", pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState)
            } )
            .catch(e => console.log(e));







        /*
        let conn = await that.webRtcConnectionManager.getConnection(that.connection.id);
        that.logger.log("internal", LOG_ID + "[onInitiateRequest] conn : ", conn);
        let r = await conn.applyOffer(offer);
        that.logger.log("internal", LOG_ID + "[onInitiateRequest] applyOffer r : ", r);
        // that.logger.log("debug", LOG_ID + "[onInitiateRequest] applyOffer getStats : ", await conn.getStats());
        let resultAnswer = await conn.createAnswer();
        that.logger.log("debug", LOG_ID + "[onInitiateRequest] resultAnswer : ", resultAnswer);
        this.logger.log("info", LOG_ID +'(onInitiateRequest) conn : ', conn.toJSON());

        // that.logger.log("debug", LOG_ID + "[onInitiateRequest] createAnswer getStats : ", await conn.getStats());
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
        /*).catch(err => {
            that.logger.log("internalerror", LOG_ID + "[onInitiateRequest] Error while applyAnswer r : ", err);
        });

       // */
    }

    async  onTransportInfoRequest(result, stanza): Promise<void> {
        let that = this;
        that.logger.log("internal", LOG_ID + "[onTransportInfoRequest] result : ", result);

        return;

        if ( !result.candidates[0]) {
            return new Promise((resolve, reject) =>
            {
                resolve();
            });
        }
        this.logger.log("info", LOG_ID +'(onTransportInfoRequest) candidate : ', result.candidates[0].candidate);
        let conn = await that.webRtcConnectionManager.getConnection(that.connection.id);

        this.logger.log("info", LOG_ID +'(onTransportInfoRequest) conn : ', conn.toJSON());



       /* ////// to modify
        var idx = -1;
        var i;
        for (i = 0; i < self.remoteSDP.media.length; i++) {
            if (SDPUtil.find_line(self.remoteSDP.media[i], 'a=mid:' + $(this).attr('name')) ||
                self.remoteSDP.media[i].indexOf('m=' + $(this).attr('name')) === 0) {
                idx = i;
                break;
            }
        }
        if (idx == -1) { // fall back to localdescription
            for (i = 0; i < self.localSDP.media.length; i++) {
                if (SDPUtil.find_line(self.localSDP.media[i], 'a=mid:' + $(this).attr('name')) ||
                    self.localSDP.media[i].indexOf('m=' + $(this).attr('name')) === 0) {
                    idx = i;
                    break;
                }
            }
        } //*/

        ////// to modify end
        //var name = $(this).attr('name');
        // TODO: check ice-pwd and ice-ufrag?
        // if ($(this).attr('ufrag') && $(this).attr('pwd')) {
        //    Strophe.log(Strophe.LogLevel.ERROR, $(this).attr('ufrag'));
        //    Strophe.log(Strophe.LogLevel.ERROR, $(this).attr('pwd'));
        // }

        let ufrag,
            pwd;

        let network = "",
            id = "";
        // network = $(this).attr('network');
        // id = $(this).attr('id');

/*        stanza.find('content>transport').each(function() {
            ufrag = this.getAttribute("ufrag");
            pwd = this.getAttribute("pwd");
            that.logger.log("info", LOG_ID +'(onTransportInfoRequest) ufrag : ', ufrag, ", pwd : ", pwd);
        }); // */
        let tmp = stanza.find("transport"); //,'urn:xmpp:jingle:transports:ice-udp:1');
        if (tmp.length) {
            //tmp = tmp[0];
            ufrag = tmp.getAttr("ufrag");
            pwd = tmp.getAttr("pwd");
            that.logger.log("info", LOG_ID + '(onTransportInfoRequest) ufrag : ', ufrag, ", pwd : ", pwd);
            for (const cand of tmp.getChildren('candidate')) {
                let line, candidate;
                line = SDPUtil.candidateFromJingle2(cand, ufrag, pwd);
                let cdte = SDPUtil.parse_icecandidate(line);
                cdte["sdpMid"] = "0";
                cdte["sdpMLineIndex"] = 0;
                cdte["candidate"] = line;
                cdte["usernameFragment"] = ufrag;

                /* let cdte = {
                    sdpMLineIndex: 0,
                    sdpMid: 0,
                    candidate: line
                }; //*/
                that.logger.log("info", LOG_ID + '(onTransportInfoRequest) cdte : ', cdte);
                candidate = new RTCIceCandidate(cdte);
                /*candidate = new window.RTCIceCandidate({
                    sdpMLineIndex: 0,
                    sdpMid: 0,
                    candidate: line
                }); // */
                try {
                    //self.peerconnection.addIceCandidate(candidate);


                    that.logger.log("info", LOG_ID + '(onTransportInfoRequest) candidate : ', candidate);

                    //let connConfig = await conn.getConfiguration();
//                    that.logger.log("debug", LOG_ID + "[onTransportInfoRequest] getStats : ", await conn.getStats());
                    //that.logger.log("info", LOG_ID + '(onTransportInfoRequest) connConfig : ', connConfig);
                    let r = await conn.addIceCandidate(candidate); //.then(async r => {
                    that.logger.log("internal", LOG_ID + "[onTransportInfoRequest] addIceCandidate result : ", r);
                        //that.logger.log("debug", LOG_ID + "[onTransportInfoRequest] addIceCandidate getStats : ", await conn.getStats());
                    /*}).catch((err) => {
                        that.logger.log("internal", LOG_ID + "[onTransportInfoRequest] addIceCandidate error : ", err);
                    }); // */

                } catch (e) {
                    that.logger.log("error", LOG_ID + '(onTransportInfoRequest) addIceCandidate CATCH Error !!!');
                    that.logger.log("internalerror", LOG_ID + '(onTransportInfoRequest) addIceCandidate CATCH Error !!! : ', e);
                }
            }
        }















      return ;
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

        /*cdte =  {
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
        } ; */

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
        //that.connection = new DefaultRTCPeerConnection();
        that.pc1 = new DefaultRTCPeerConnection({
            sdpSemantics: 'plan-b'
        });
        that.logger.log("internal", LOG_ID + "[createConnection] DefaultRTCPeerConnection created." );
        function onIceCandidate1({ candidate }) {
            console.log("onIceCandidate1 Candidates : ", candidate);
            if (!candidate) {
                //options.clearTimeout(timeout);
                that.pc1.removeEventListener('icecandidate', onIceCandidate1);
                //deferred.resolve();
            } else {
                console.log("onIceCandidate1 Candidates : ", candidate,  ", self.connection.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                return that.connection.addIceCandidate(candidate);
            }
        }
        that.pc1.addEventListener('icecandidate', onIceCandidate1);
        function onIceCandidate2({ candidate }) {
            if (!candidate) {
                //options.clearTimeout(timeout);
                that.pc1.removeEventListener('icecandidate', onIceCandidate2);
                //deferred.resolve();
            } else {
                console.log("onIceCandidate2 Candidates : ", candidate,  ", pc2.signalingState : ", that.connection.signalingState, ", iceConnectionState : ", that.connection.iceConnectionState);
                return that.pc1.addIceCandidate(candidate);
            }
        }
        that.connection.addEventListener('icecandidate', onIceCandidate2);

        that.pc1.onnegotiationneeded = e => {
            that.logger.log("internal", LOG_ID + "[createConnection] that.pc1.onnegotiationneeded : ", e);
        };

        that.pc1.createDataChannel("dummy");

        that.logger.log("internal", LOG_ID + "[createConnection] create the web rtc connection : ", that.connection);
        that.logger.log("internal", LOG_ID + "[createConnection] _exiting_" );
        return that.connection;
    }

    async testconnection() {
        let pc1 = new DefaultRTCPeerConnection();
        let pc2 = await this.createConnection();

        // pc1.onicecandidate = e => pc2.addIceCandidate(e.candidate);
        // pc2.onicecandidate = e => pc1.addIceCandidate(e.candidate);

        function onIceCandidate1({ candidate }) {
            if (!candidate) {
                //options.clearTimeout(timeout);
                pc1.removeEventListener('icecandidate', onIceCandidate1);
                //deferred.resolve();
            } else {
                console.log("onIceCandidate1 Candidates : ", candidate,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return pc2.addIceCandidate(candidate);
            }
        }
        pc1.addEventListener('icecandidate', onIceCandidate1);
        function onIceCandidate2({ candidate }) {
            if (!candidate) {
                //options.clearTimeout(timeout);
                pc1.removeEventListener('icecandidate', onIceCandidate2);
                //deferred.resolve();
            } else {
                console.log("onIceCandidate2 Candidates : ", candidate,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return pc1.addIceCandidate(candidate);
            }
        }
        pc2.addEventListener('icecandidate', onIceCandidate2);


        pc1.onnegotiationneeded = e =>
            pc1.createOffer().then(d => {
                console.log("d : ", d);
                let sldd =  pc1.setLocalDescription(d);
                console.log(" 1 pc1.signalingState : ", pc1.signalingState, ", iceConnectionState : ", pc1.iceConnectionState);
                return sldd;
            })
                .then(() =>{
                    console.log(" 2 pc1.localDescription : ", pc1.localDescription,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                   // let pld =  pc2.setRemoteDescription(pc1.localDescription);
                    let pld = pc2.applyOffer(pc1.localDescription);
                    console.log(" 3 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                    return pld;
                })
                .then(() => {
                    console.log(" 4 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                    let ca = pc2.createAnswer();
                    console.log(" 5 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                    return ca;
                }).then(d => {
               /* console.log(" 6 pc1.signalingState : ", pc1.signalingState, ", iceConnectionState : ", pc1.iceConnectionState);
                let sld =  pc2.setLocalDescription(d);
                console.log(" 7 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return sld; // */
               return d;
            })
                .then(() => {
                    console.log(" 8 pc2.localDescription : ", pc2.localDescription,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                    let sld2 = pc1.setRemoteDescription(pc2.localDescription);
                    console.log(" 9 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                    return sld2;
                })
                .then(() => {
                    console.log("pc1.canTrickleIceCandidates : ", pc1.canTrickleIceCandidates,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState)
                } )
                .catch(e => console.log(e));

        pc1.createDataChannel("dummy");
        // */

    }

}

module.exports.WebRtcService = WebRtcService;
export {WebRtcService};
