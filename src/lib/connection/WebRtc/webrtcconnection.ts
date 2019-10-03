'use strict';

import {RTCPeerConnection as DefaultRTCPeerConnection} from 'wrtc';
import {RTCIceCandidate} from "wrtc";
import  {ConnectionWebRtc} from './connectionwebrtc';

const TIME_TO_CONNECTED = 10000;
const TIME_TO_HOST_CANDIDATES = 3000;  // NOTE(mroberts): Too long.
const TIME_TO_RECONNECTED = 10000;

class WebRtcConnection extends ConnectionWebRtc {
  public doOffer: () => Promise<void>;
  public applyAnswer: (answer) => Promise<void>;
  public close: () => void;
  public toJSON: () => any;
    private addIceCandidate: (answer : RTCIceCandidate) => Promise<void>;
  constructor(id, options : any = {}) {
    super(id);

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

    const peerConnection = new RTCPeerConnection({
      sdpSemantics: 'unified-plan'
    });

    options.beforeOffer.beforeOffer(peerConnection);

    let connectionTimer = options.setTimeout(() => {
      if (peerConnection.iceConnectionState !== 'connected'
        && peerConnection.iceConnectionState !== 'completed') {
        this.close();
      }
    }, timeToConnected);

    let reconnectionTimer = null;

    const onIceConnectionStateChange = () => {
      if (peerConnection.iceConnectionState === 'connected'
        || peerConnection.iceConnectionState === 'completed') {
        if (connectionTimer) {
          options.clearTimeout(connectionTimer);
          connectionTimer = null;
        }
        options.clearTimeout(reconnectionTimer);
        reconnectionTimer = null;
      } else if (peerConnection.iceConnectionState === 'disconnected'
        || peerConnection.iceConnectionState === 'failed') {
        if (!connectionTimer && !reconnectionTimer) {
          const self = this;
          reconnectionTimer = options.setTimeout(() => {
            self.close();
          }, timeToReconnected);
        }
      }
    };

    peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);

    this.doOffer = async () => {
      const offer = await peerConnection.createOffer();

      //disableTrickleIce();
      await peerConnection.setLocalDescription(offer);
      try {
        await waitUntilIceGatheringStateComplete(peerConnection, options);
      } catch (error) {
        this.close();
        throw error;
      }
    };

    this.applyAnswer = async answer => {
      await peerConnection.setRemoteDescription(answer);
    };

    this.addIceCandidate = async candidate => {
        await peerConnection.addIceCandidate(candidate);
    };


      this.close = () => {
      peerConnection.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange);
      if (connectionTimer) {
        options.clearTimeout(connectionTimer);
        connectionTimer = null;
      }
      if (reconnectionTimer) {
        options.clearTimeout(reconnectionTimer);
        reconnectionTimer = null;
      }
      peerConnection.close();
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
          return peerConnection.iceConnectionState;
        }
      },
      localDescription: {
        get() {
          return descriptionToJSON(peerConnection.localDescription, true);
        }
      },
      remoteDescription: {
        get() {
          return descriptionToJSON(peerConnection.remoteDescription, false);
        }
      },
      signalingState: {
        get() {
          return peerConnection.signalingState;
        }
      }
    });
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
