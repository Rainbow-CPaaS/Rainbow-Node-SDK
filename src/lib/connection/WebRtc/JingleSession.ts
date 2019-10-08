"use strict";


import {SDP, createSDP} from './SDP';

// @ts-ignore
const SDPUtilFac = require('./SDPUtil.js');

// @ts-ignore
const Stanza = require('node-xmpp-core').Stanza;

class JingleSession {
    private me: any;
    private sid: any;
    private localSDP: any;
    private remoteSDP: any;
    private fullJid: any;
    private peerJid: any;
    private callernumber: any;
    private callednumber: any;
    private mediaType: any;
    private initiator: any;
    private muted: boolean;
    private delayedCandidates: any[];
    private responder: any;

    constructor(me, peerjid, initiator, sid) {
        this.me = me;
        this.sid = sid;

        this.localSDP = {};
        this.remoteSDP = null;

        this.peerJid = peerjid;
        this.fullJid = peerjid;

        this.initiator = initiator;
        this.responder = !initiator ? this.me : peerjid;

        this.mediaType = null;
        this.callednumber = null;
        this.callernumber = null;

        this.muted = false;
        this.delayedCandidates = [];
    }

    getInitiator() {
        return this.initiator == this.me ? this.initiator : this.peerJid;
    }

    sessionInitiate(id, sdp, callerInfo) {
        let self = this;
        //console.log('JingleSession: sessionInitiate SDP', sdp);
        this.localSDP = createSDP(sdp);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-initiate',
            initiator: this.initiator,
            callernumber: this.callernumber,
            sid: this.sid
        });

        //let callerInfo = {"callernumber": this.callernumber};

        stanzaPtr = this.localSDP.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder', callerInfo);

        return stanza;
    }

//EBR+
    sessionInfo(id, state) {
        let self = this;
        //console.log('JingleSession: sessionInfo');

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-info',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid
        }).c(state, {xmlns: 'urn:xmpp:jingle:apps:rtp:info:1'});

        return stanza;
    }

    //EBR-

    sessionRinging(id) {
        let self = this;
        //console.log('JingleSession: sessionRinging');

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-info',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid
        }).c('ringing', {xmlns: 'urn:xmpp:jingle:apps:rtp:info:1'});

        return stanza;
    }

    sessionProceeding(id) {
        let self = this;
        //console.log('JingleSession: sessionProceeding');

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-info',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid
        }).c('proceeding', {xmlns: 'urn:xmpp:jingle:apps:rtp:info:1'});

        return stanza;
    }

    sessionAccept(id, sdp) {
        let self = this;
        //console.log('JingleSession: sessionAccept');
        this.localSDP = createSDP(sdp);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-accept',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            responder: this.initiator == this.me ? this.peerJid : this.initiator,
            sid: this.sid,
            localType: this.mediaType
        });

        this.localSDP.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder');

        return stanza;
    }

    sessionTerminate(id, reason) {
        let self = this;
        //console.log('JingleSession: sessionTerminate reason', reason);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-terminate',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid
        }).c(reason || 'success');

        return stanza;
    }

    sessionMute(id, muted) {
        let self = this;
        //console.log('JingleSession: sessionMute');

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'session-info',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid
        }).c(muted ? 'mute' : 'unmute', {xmlns: 'urn:xmpp:jingle:apps:rtp:info:1'});

        return stanza;
    }

    transportInfo(id, candidate) {
        let self = this;
        //console.log('JingleSession: transportInfo candidate ', candidate);

        let SDPUtil = new SDPUtilFac.createSDPUtil();

        let candidates = [candidate];

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'transport-info',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid,
            localType: this.mediaType
        });

        for (let mid = 0; mid < this.localSDP.media.length; mid++) {
            let cands = candidates.filter(function (el) {
                return el.sdpMLineIndex == mid;
            });
            let mline = SDPUtil.parse_mline(this.localSDP.media[mid].split('\r\n')[0]);
            if (cands.length > 0) {
                let ice = SDPUtil.iceparams(this.localSDP.media[mid], this.localSDP.session);
                ice.xmlns = 'urn:xmpp:jingle:transports:ice-udp:1';
                stanzaPtr = stanzaPtr.c('content', {
                    creator: this.initiator == this.me ? 'initiator' : 'responder',
                    name: (cands[0].sdpMid ? cands[0].sdpMid : mline.media)
                }).c('transport', ice);
                for (let i = 0; i < cands.length; i++) {
                    stanzaPtr = stanzaPtr.c('candidate', SDPUtil.candidateToJingle(cands[i].candidate));
                    stanzaPtr = stanzaPtr.up();
                }
                // add fingerprint
                if (SDPUtil.find_line(this.localSDP.media[mid], 'a=fingerprint:', this.localSDP.session)) {
                    let tmp = SDPUtil.parse_fingerprint(SDPUtil.find_line(this.localSDP.media[mid], 'a=fingerprint:', this.localSDP.session));
                    tmp.required = true;
                    stanzaPtr = stanzaPtr.c('fingerprint').t(tmp.fingerprint);
                    delete tmp.fingerprint;
                    stanzaPtr.setAttrs(tmp);
                    stanzaPtr = stanzaPtr.up();
                }
                stanzaPtr = stanzaPtr.up(); // transport
                stanzaPtr = stanzaPtr.up(); // content
            }
        }
        return stanza;
    }

    //EBR200218+
    transportAccept(id, sdp, mediaType = 'audio') {
        let self = this;
        //console.log('JingleSession: transportAccept');
        this.localSDP = createSDP(sdp);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'transport-accept',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid,
            localType: mediaType
        });

        this.localSDP.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder');

        return stanza;
    }

    transportReplace(id, sdp, mediaType = 'audio') {
        let self = this;
        //console.log('JingleSession: transportReplace');
        this.localSDP = createSDP(sdp);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'transport-replace',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid,
            localType: mediaType
        });

        this.localSDP.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder');

        return stanza;
    }

    contentModify(id, sdp, mediaType = 'audio') {
        let self = this;
        //console.log('JingleSession: contentModify');
        this.localSDP = createSDP(sdp);

        let stanza = new Stanza('iq', {type: 'set', from: this.me, to: this.fullJid, id: id});
        let stanzaPtr;
        stanzaPtr = stanza.c('jingle', {
            xmlns: 'urn:xmpp:jingle:1',
            action: 'content-modify',
            initiator: this.initiator == this.me ? this.initiator : this.peerJid,
            sid: this.sid,
            localType: mediaType
        });

        this.localSDP.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder');

        return stanza;
    }

    //EBR200218-

    // handlers
    handleSessionInitiate(el) {
        let self = this;

        this.remoteSDP = createSDP('');
        //console.log('JingleSession: handleSessionInitiate');
        this.remoteSDP.fromJingle(el);
        //console.log('JingleSession: handleSessionInitiate: SDP is ' + this.remoteSDP.raw);
    }

    handleTransportReplace(el) {
        let self = this;

        this.remoteSDP = createSDP('');
        //console.log('JingleSession: handleTransportReplace');
        this.remoteSDP.fromJingle(el);
        //console.log('JingleSession: handleTransportReplace: SDP is ' + this.remoteSDP.raw);
    }

    handleContentAdd(el) {
        let self = this;

        this.remoteSDP = createSDP('');
        //console.log('JingleSession: handleContentAdd');
        this.remoteSDP.fromJingle(el);
        //console.log('JingleSession: handleContentAdd: SDP is ' + this.remoteSDP.raw);
    }

    handleContentModify(el) {
        let self = this;

        this.remoteSDP = createSDP('');
        //console.log('JingleSession: handleContentModify');
        this.remoteSDP.fromJingle(el);
        //console.log('JingleSession: handleContentModify: SDP is ' + this.remoteSDP.raw);
    }

    handleSessionAccept(el) {
        let self = this;

        this.remoteSDP = createSDP('');
        //console.log('JingleSession: handleSessionAccept');
        this.remoteSDP.fromJingle(el);
        //console.log('JingleSession: handleSessionAccept: SDP is ' + this.remoteSDP.raw);
    }

    handleSessionTerminate(el) {
        let self = this;
        //console.log('JingleSession: handleSessionTerminate');
    }

    getDelayedCandidates() {
        let self = this;
        //console.log('JingleSession: getDelayedCandidates');
        let candidates = [];
        for (let i = 0; i < self.delayedCandidates.length; i++) {
            let newCandidates = self.processCandidates(self.delayedCandidates[i]);
            for (let j = 0; j < newCandidates.length; j++) {
                candidates.push(newCandidates[j]);
            }
        }
        return candidates;
    }

    deleteDelayedCandidates() {
        let self = this;
        //console.log('JingleSession: deleteDelayedCandidates');
        self.delayedCandidates = [];
    }

    processCandidates(el) {
        let self = this;
        let candidates = [];
        let SDPUtil = new SDPUtilFac.createSDPUtil();
        // operate on each content element
        el.forEach(function (content) {
            let idx = -1;
            let i;
            for (i = 0; i < self.remoteSDP.media.length; i++) {
                if (SDPUtil.find_line(self.remoteSDP.media[i], 'a=mid:' + content.attr('name')) ||
                    self.remoteSDP.media[i].indexOf('m=' + content.attr('name')) === 0) {
                    idx = i;
                    break;
                }
            }
            if (idx == -1) { // fall back to localdescription
                for (i = 0; i < self.localSDP.media.length; i++) {
                    if (SDPUtil.find_line(self.localSDP.media[i], 'a=mid:' + content.attr('name')) ||
                        self.localSDP.media[i].indexOf('m=' + content.attr('name')) === 0) {
                        idx = i;
                        break;
                    }
                }
            }
            let name = content.attr('name');
            if (content.getChildren('transport').length) {
                if (content.getChildren('transport')[0].getChildren('candidate').length) {
                    content.getChildren('transport')[0].getChildren('candidate').forEach(function (cand) {
                        let line, candidate;
                        let type = cand.getAttr('type');
                        line = SDPUtil.candidateFromJingle(cand, false);
                        candidates.push({sdpMLineIndex: idx, sdpMid: name, candidate: line});
                    })
                }
            }
        });
        return candidates;
    }

    handleTransportInfo(el) {
        let self = this;
        //console.log('JingleSession: handleTransportInfo');
        if (self.remoteSDP === null) {
            //console.log('JingleSession: handleTransportInfo: store ICE candidate');
            self.delayedCandidates.push(el);
            return [];
        } else {
            //console.log('JingleSession: handleTransportInfo: process ICE candidate');
            return self.processCandidates(el);
        }
    }

    handleSessionInfo(el) {
        let self = this;

        //console.log('JingleSession: handleSessionInfo');
        let ringing = el.getChild('ringing', 'urn:xmpp:jingle:apps:rtp:info:1');
        if (ringing !== undefined) {
            return 'ringing';
        } else {
            let mute = el.getChild('mute', 'urn:xmpp:jingle:apps:rtp:info:1');
            if (mute !== undefined) {
                this.muted = true;
                return 'mute';
            } else {
                let unmute = el.getChild('unmute', 'urn:xmpp:jingle:apps:rtp:info:1');
                if (unmute !== undefined) {
                    this.muted = false;
                    return 'unmute';
                } else {
                    return 'other';
                }
            }
        }
    }


    accept(peerconnection) {
        try {
            let that = this;
            let state = 'active';

            let pranswer = peerconnection.localDescription;
            // let pranswer = this.peerconnection.localDescription;
            if (!pranswer || ( pranswer.type != 'pranswer' && pranswer.type != 'answer') ) {
                return;
            }
            //Strophe.log("", '[Strophe.jingle] going from pranswer to answer');
            let SDPUtil = new SDPUtilFac.createSDPUtil();

            while (SDPUtil.find_line(pranswer.sdp, 'a=inactive')) {
                // FIXME: change any inactive to sendrecv or whatever they were originally
                pranswer.sdp = pranswer.sdp.replace('a=inactive', 'a=sendrecv');
            }
            let prsdp = new SDP(pranswer.sdp);

            let stanza = new Stanza('iq', {type: 'set', to: this.peerJid});
            let stanzaPtr;
            stanzaPtr = stanza.c('jingle', {
                xmlns: 'urn:xmpp:jingle:1',
                action: 'session-accept',
                initiator: this.initiator,
                responder: this.responder,
                sid: this.sid,
                localType: "audio" // this.localType
            });


            /*let accept = $iq({
                to: this.peerjid,
                type: 'set'
            })
                .c('jingle', {
                    xmlns: 'urn:xmpp:jingle:1',
                    action: "session-accept",
                    initiator: this.initiator,
                    responder: this.responder,
                    sid: this.sid,
                    localType: this.localType
                }); // */
            prsdp.toJingle(stanzaPtr, this.initiator == this.me ? 'initiator' : 'responder', that.callednumber);
            return stanzaPtr;
        } catch (err) {
            console.log("Catch Error : " + err.message);
        }
    }

}

function createJingleSession(me, peerjid, initiator, sid) {
    return new JingleSession(me, peerjid, initiator, sid);
}

module.exports.createJingleSession = createJingleSession;
