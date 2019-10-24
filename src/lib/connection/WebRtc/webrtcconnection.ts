'use strict';

import {RTCPeerConnection as DefaultRTCPeerConnection} from "wrtc";
import {RTCIceCandidate, RTCSessionDescription} from "wrtc";
import  {ConnectionWebRtc} from './connectionwebrtc';
import {publicDecrypt} from "crypto";
import {setFlagsFromString} from "v8";
import set = Reflect.set;
import {until} from "../../common/Utils";

const TIME_TO_CONNECTED = 10000;
const TIME_TO_HOST_CANDIDATES = 3000;  // NOTE(mroberts): Too long.
const TIME_TO_RECONNECTED = 10000;

class WebRtcConnection extends ConnectionWebRtc {
  get peerConnection(): any {
    return this._peerConnection;
  }
  public doOffer: () => Promise<void>;
  public applyAnswer: (answer) => Promise<void>;
  public applyOffer: (offer) => Promise<void>;
  public createAnswer: () => any;
  public close: () => void;
  public toJSON: () => any;
  private addIceCandidate: (answer : RTCIceCandidate) => Promise<void>;
  private _peerConnection : any;


    constructor(id, options : any = {}) {
    super(id);

    let that = this;

    options = {
      RTCPeerConnection: DefaultRTCPeerConnection,
      beforeOffer(peerConnection: any) {},
      clearTimeout,
      setTimeout,
      timeToConnected: TIME_TO_CONNECTED,
      timeToHostCandidates: TIME_TO_HOST_CANDIDATES,
      timeToReconnected: TIME_TO_RECONNECTED,
      ...options
    };

    const {
      RTCPeerConnection,
      beforeOffer,
      timeToConnected,
      timeToReconnected
    }  = options;

      console.log("(WebRtcConnection) constructor : ");

      that._peerConnection = new RTCPeerConnection({
      //sdpSemantics: 'unified-plan'
      sdpSemantics: 'plan-b',
        iceCandidatePoolSize: 20,
        iceServers: options.iceServers
    }, {
        'optional': [{
          'DtlsSrtpKeyAgreement': true
        }]
      }
    ); // */

      function onIceCandidate_({ candidate }) {
        if (!candidate) {
          //options.clearTimeout(timeout);
          that._peerConnection.removeEventListener('icecandidate', onIceCandidate_);
          //deferred.resolve();
        } else {
          console.log("onIceCandidate_ Candidates : ", candidate,  ", that._peerConnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
          //return that._peerConnection.addIceCandidate(candidate);
        }
      }
      that._peerConnection.addEventListener('icecandidate', onIceCandidate_);

/*
      let pc1 = new RTCPeerConnection(), pc2 = new RTCPeerConnection();

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
      pc1.addEventListener('icecandidate', onIceCandidate2);


      pc1.onnegotiationneeded = e =>
          pc1.createOffer().then(d => {
            console.log("d : ", d);
            let sldd =  pc1.setLocalDescription(d);
            console.log(" 1 pc1.signalingState : ", pc1.signalingState, ", iceConnectionState : ", pc1.iceConnectionState);
            return sldd;
          })
              .then(() =>{
                console.log(" 2 pc1.localDescription : ", pc1.localDescription,  ", pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                let pld =  pc2.setRemoteDescription(pc1.localDescription);
                console.log(" 3 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return pld;
              })
              .then(() => {
                console.log(" 4 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                 let ca = pc2.createAnswer();
                console.log(" 5 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
                return ca;
              }).then(d => {
            console.log(" 6 pc1.signalingState : ", pc1.signalingState, ", iceConnectionState : ", pc1.iceConnectionState);
            let sld =  pc2.setLocalDescription(d);
            console.log(" 7 pc2.signalingState : ", pc2.signalingState, ", iceConnectionState : ", pc2.iceConnectionState);
            return sld;
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

    options.beforeOffer.beforeOffer(that._peerConnection);

    let connectionTimer = options.setTimeout(() => {
      if (that._peerConnection.iceConnectionState !== 'connected'
        && that._peerConnection.iceConnectionState !== 'completed') {
        this.close();
      }
    }, timeToConnected);

    let reconnectionTimer = null;

    const onIceConnectionStateChange = () => {
      console.log("onIceConnectionStateChange this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
      if (that._peerConnection.iceConnectionState === 'connected'
        || that._peerConnection.iceConnectionState === 'completed') {
        if (connectionTimer) {
          options.clearTimeout(connectionTimer);
          connectionTimer = null;
        }
        options.clearTimeout(reconnectionTimer);
        reconnectionTimer = null;
      } else if (that._peerConnection.iceConnectionState === 'disconnected'
        || that._peerConnection.iceConnectionState === 'failed') {
        if (!connectionTimer && !reconnectionTimer) {
          const self = this;
          reconnectionTimer = options.setTimeout(() => {
            self.close();
          }, timeToReconnected);
        }
      }
    };

      that._peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);

    this.doOffer = async () => {
      const offer = await that._peerConnection.createOffer();
      console.log("doOffer this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);

      //disableTrickleIce();
      await that._peerConnection.setLocalDescription(offer);
      try {
        await waitUntilIceGatheringStateComplete(that._peerConnection, options);
      } catch (error) {
        this.close();
        throw error;
      }
    };

    this.applyAnswer = async answer => {
      console.log("applyAnswer this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
      const answerRTC = new RTCSessionDescription({
      //const answerRTC = {
        type: answer.type,
        sdp: answer.sdp
      }); //
      console.log("applyAnswer will setRemoteDescription answerRTC : ", answerRTC);
      return await that._peerConnection.setRemoteDescription(answerRTC).catch((err) => {
        console.log("applyAnswer Error setRemoteDescription error : ", err);
      });
    };




      this.applyOffer = async offer => {
        console.log("applyOffer this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
        const offerRTCSessionDescription = new RTCSessionDescription({
          //const answerRTC = {
          type: offer.type,
          sdp: offer.sdp
        }); //
        console.log("applyOffer will setRemoteDescription offerRTCSessionDescription : ", offerRTCSessionDescription);
        let setRemtDescResult =  await that._peerConnection.setRemoteDescription(offerRTCSessionDescription).catch((err) => {
          console.log("applyOffer Error setRemoteDescription error : ", err);
        });
        console.log("applyOffer setRemoteDescription setted, this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
        return setRemtDescResult;
      };

      this.createAnswer = async function () {
        console.log("createAnswer this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);

        const originalAnswer = await that._peerConnection.createAnswer();
        console.log("createAnswer originalAnswer : ", originalAnswer);
        const updatedAnswer = new RTCSessionDescription({
          type: 'answer',
          sdp: originalAnswer.sdp.replace('a=sendrecv', 'a=recvonly' )
        }); // */
        // sdp: stereo ? enableStereoOpus(originalAnswer.sdp) : originalAnswer.sdp
        console.log("createAnswer updatedAnswer : ", updatedAnswer);
        let setlocalDesc = await that._peerConnection.setLocalDescription(updatedAnswer).catch((err) => {
          console.log("createAnswer setLocalDescription failed : ", err)
        });
        console.log("createAnswer setLocalDescription setted, this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState, ", conn : ", that.toJSON());
        return that._peerConnection.localDescription;
      };

      this.addIceCandidate = async candidate => {
        console.log("addIceCandidate candidate : ", candidate, ", this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
        await until(() => {
          return that._peerConnection.signalingState != "have-remote-offer";
        }, "waiting for that._peerConnection.signalingState == \"have-remote-offer\" before adding ICE Candidate.", 10000);
        console.log("addIceCandidate this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
        return await that._peerConnection.addIceCandidate(candidate).catch((err) => {
          console.log("addIceCandidate error : ", err);
        });
      };


      this.close = () => {
        that._peerConnection.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange);
      if (connectionTimer) {
        options.clearTimeout(connectionTimer);
        connectionTimer = null;
      }
      if (reconnectionTimer) {
        options.clearTimeout(reconnectionTimer);
        reconnectionTimer = null;
      }
        that._peerConnection.close();
      super.close();
    };

    this.toJSON = () => {
      return {
        ...super.toJSON(),
        iceConnectionState: this.iceConnectionState,
        localDescription: this.localDescription,
        remoteDescription: this.remoteDescription,
        signalingState: this.signalingState
      };
    };

    Object.defineProperties(this, {
      iceConnectionState: {
        get() {
          return that._peerConnection.iceConnectionState;
        }
      },
      localDescription: {
        get() {
          return descriptionToJSON(that._peerConnection.localDescription, true);
        }
      },
      remoteDescription: {
        get() {
          return descriptionToJSON(that._peerConnection.remoteDescription, false);
        }
      },
      signalingState: {
        get() {
          return that._peerConnection.signalingState;
        }
      }
    });
  }

  async getConfiguration() {
    let that =this;
    try {
      return await that._peerConnection.getConfiguration();
    } catch (error) {
      //this.close();
      throw error;
    }
  }

  async getStats() {
    let that =this;
    try {
      return await that._peerConnection.getStats();
    } catch (error) {
      //this.close();
      throw error;
    }
  }

}

function descriptionToJSON(description, shouldDisableTrickleIce) {
  return !description ? {} : {
    type: description.type,
    sdp: shouldDisableTrickleIce ? disableTrickleIce(description.sdp) : description.sdp
  };
}

function disableTrickleIce(sdp) {
  return sdp.replace(/\r\na=ice-options:trickle/g, '');
}

async function waitUntilIceGatheringStateComplete(peerConnection, options) {
  if (peerConnection.iceGatheringState === 'complete') {
    console.log("iceGatheringState === 'complete', return from waitUntilIceGatheringStateComplete ");
    return;
  }

  const { timeToHostCandidates } = options;

  const deferred : any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  const timeout = options.setTimeout(() => {
    peerConnection.removeEventListener('icecandidate', onIceCandidate);
    deferred.reject(new Error('Timed out waiting for host candidates'));
  }, timeToHostCandidates);

  function onIceCandidate({ candidate }) {
    if (!candidate) {
      options.clearTimeout(timeout);
      peerConnection.removeEventListener('icecandidate', onIceCandidate);
      deferred.resolve();
    }
  }

  peerConnection.addEventListener('icecandidate', onIceCandidate);

  await deferred.promise;
}

module.exports.WebRtcConnection = WebRtcConnection;
export {WebRtcConnection};
