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

      that._peerConnection = new RTCPeerConnection({
      //sdpSemantics: 'unified-plan'
      sdpSemantics: 'plan-b',
        iceCandidatePoolSize: 20,
        iceServers: options.iceServers
    });

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
        let setlocalDesc = await that._peerConnection.setLocalDescription(updatedAnswer);
        console.log("createAnswer setLocalDescription setted, this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
        return setlocalDesc;
      };

      this.addIceCandidate = async candidate => {
        console.log("addIceCandidate this.peerconnection.signalingState : ", that._peerConnection.signalingState, ", iceConnectionState : ", that._peerConnection.iceConnectionState);
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
