"use strict";

const JingleSessionFactory = require('./JingleSession.js');

// @ts-ignore
const Stanza = require('node-xmpp-core').Stanza;

// taken from Strophe.js
function getBareJidFromJid(jid) {
    return jid ? jid.split("/")[0] : null;
};

class JingleService {
    sessions: any;

    constructor () {
        this.sessions = [];
    }

    // sessions management
    createSession(me, peerjid, initiator, sid, callernumber, mediaType = 'audio') {
        let newSession = JingleSessionFactory.createJingleSession(me, peerjid, initiator, sid);
        //let newSession = JingleSessionFactory.createJingleSession(me, getBareJidFromJid(peerjid), initiator, sid); //EBR_JID
        //newSession.fullJid = peerjid; //EBR_JID
        newSession.callernumber = callernumber;
        newSession.mediaType = mediaType;

        //console.log(" ****** CREATE JINGLE SESSION with me : " + newSession.me + ', peerJid : ' + newSession.peerJid + ', fullJID : ' + newSession.fullJid + ' ********');
        //console.log(" ****** SID : " + sid + " Called number : " + newSession.callednumber + ' caller :' + newSession.callernumber + '******');

        this.sessions[sid] = newSession;
    }

    getSession(jid, uri, mediaType = 'audio') {
        let sids = [];
        //console.log(" ***** TRY TO FIND JINGLE SESSION IN SESSIONS (" + Object.keys(this.sessions).length + ")");
        for (let i in this.sessions) {
//          console.log("array["+i+"] = " + this.sessions[i] + ", typeof("+i+") == " + typeof(i));
            let test = this.sessions[i].getInitiator();
            //console.log(" ***** TRY TO FIND JINGLE SESSION from JID : " + jid + "  and URI :" + uri + "******");

            if (jid == this.sessions[i].getInitiator() && (uri == this.sessions[i].callernumber || uri == this.sessions[i].callednumber) &&
                    mediaType == this.sessions[i].mediaType) {
                sids.push(this.sessions[i].sid);
            }
        }
        /*
        if(!sids.length){
            //console.log(" Jingle session NOT FOUND!!!!");
        }
        */
        return sids;
    }

    getSessionByFullJid(jid) {
        let sids = [];
        for (let i in this.sessions) {
            //console.log("array["+i+"] = " + this.sessions[i] + ", typeof("+i+") == " + typeof(i));
            //let test = this.sessions[i].peerJid;
            //console.log(" ***** TRY TO FIND JINGLE SESSION from FULLJID : " + jid + "******");
            //console.log(" peerJid : " + test + ', jid : ' + jid);
            if (jid == this.sessions[i].peerJid) {
                if (this.sessions[i].sid && (this.sessions[i].sid !== null)) {
                    //console.log(" sid : " + this.sessions[i].sid);
                    sids.push(this.sessions[i].sid);
                } else {
                    //console.log(" sid : " + this.sessions[i].sid);
                }
            }
        }
        return sids;
    }
    getSessions(confId) {
        let sessions = [];
        for (let i in this.sessions) {
//          console.log("array["+i+"] = " + this.sessions[i] + ", typeof("+i+") == " + typeof(i));
            if( confId == this.sessions[i].confId ) {
                sessions.push({sid: this.sessions[i].sid, jid: this.sessions[i].getInitiator()});
            }
        }
        return sessions;
    }

    getSessionIds()
    {
        let sessionIds = [];
        for (let i in this.sessions) {
            sessionIds.push(this.sessions[i].sid);
        }
        return sessionIds;
    }

    getSessionById(sessionId) {
        for (let i in this.sessions) {
            if (sessionId === this.sessions[i].sid) {
                return this.sessions[i];
            }
        }
        return;
    }

    deleteSession(jid, callednumber, mediaType = 'audio') {
        let sids = this.getSession(jid, callednumber, mediaType);
        for (let i in sids) {
            this.deleteSessionBySid(sids[i]);
        }
    }

    deleteSessionBySid(sid) {
        //console.log(" ****** DELETE JINGLE SESSION with SID : " + sid);
        delete this.sessions[sid];
    }

    // misc methods
    getPeerFullJidByBareJid(jid) {
        let fullJid = '';
        for (let i in this.sessions) {
//          console.log("array["+i+"] = " + this.sessions[i] + ", typeof("+i+") == " + typeof(i));
            if( jid == this.sessions[i].getInitiator() ) {
                fullJid = this.sessions[i].fullJid;
            }
        }
        return fullJid;
    }

    // stanza handler
    handleIqStanza(stanza) {
        let self = this;

        let sid = stanza.getChild('jingle').attr('sid');
        let action = stanza.getChild('jingle').attr('action');

        let callednumber;

        let mediaType = stanza.getChild('jingle').attr('localType');
        switch (mediaType) {
            case 'audio':
            case 'video':
            case 'sharing':
            case 'sip':
                break;
            default:
                mediaType = 'audio';
                break;
        };
        if( stanza.getChild('jingle').getChild('mediapillar', 'urn:xmpp:janus:1') !== undefined ) {
            let mediapillarTag = stanza.getChild('jingle').getChild('mediapillar', 'urn:xmpp:janus:1');
            let callednumberTag = mediapillarTag.getChild('callednumber');
            callednumber = callednumberTag.text();

        } /* else if ( stanza.getChild('jingle').getChild('conference', 'urn:xmpp:janus:1') !== undefined ) {
            confId = stanza.getChild('jingle').getChild('conference', 'urn:xmpp:janus:1').attr('id');
        } // */

        let from = stanza.attr('from');
        let fromBareJid = getBareJidFromJid(from);
        //console.log('bare id is ', fromBareJid);
        let to = stanza.attr('to');
        let id = stanza.attr('id');

        let ack = new Stanza('iq', {type: 'result', from: to, to: from, id:id});

        let session = this.sessions[sid];

        let returnObject : any = {};

        if( action === 'session-initiate' ) {
            if (session !== undefined ) {
                //console.log('session with the same SID already exists');
                ack.attr('type', 'error');
                ack.c('error', {type: 'cancel'}).c('service-unavailable', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'}).up();
                returnObject.ack = ack;
                returnObject.processed = false;
                return returnObject;
            } else {
                let existingSid = this.getSession(fromBareJid, callednumber, mediaType);
                if( existingSid.length > 0 ) {
                    //console.log('JingleSession: session with the same callednumber, jid and mediaType already exist');
                    // this.deleteSessionBySid(existingSid);
                    this.deleteSession(fromBareJid, callednumber, mediaType);
                }
            }
        } else {
            if ( session === null || session === undefined ) {
                ack.attr('type', 'error');
                ack.c('error', {type: 'cancel'})
                .c('item-not-found', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'}).up()
                .c('unknown-session', {xmlns: 'urn:xmpp:jingle:errors:1'});
                returnObject.ack = ack;
                returnObject.processed = false;

                //console.log('FIST CASE ');

                return returnObject;
            } else {
                // if ( fromBareJid != session.peerJid ) {
                //     console.log('jid mismatch for session id', sid);
                //     ack.attr('type', 'error');
                //     ack.c('error', {type: 'cancel'})
                //     .c('item-not-found', {xmlns: 'urn:ietf:params:xml:ns:xmpp-stanzas'}).up()
                //     .c('unknown-session', {xmlns: 'urn:xmpp:jingle:errors:1'});
                //     returnObject.ack = ack;
                //     returnObject.processed = false;
                //     return returnObject;
                // } else {
                // }
            }
        }

        //console.log('JingleSession: handleStanza action: ', action);

        switch (action) {
        case 'session-initiate':
            let newSession = JingleSessionFactory.createJingleSession(to, fromBareJid, fromBareJid, sid);
            newSession.fullJid = from;
            newSession.callednumber = callednumber;
            newSession.mediaType = mediaType;
            newSession.handleSessionInitiate(stanza.getChild('jingle'));

            //console.log(" ****** CREATE JINGLE SESSION with me : " + newSession.me + ', peerJid : ' + newSession.peerJid + ', fullJID : ' + newSession.fullJid + ' ********');
            //console.log(" ****** Called number : " + newSession.callednumber + ' caller :' + newSession.callernumber + '******');

            // add date
            newSession.creationTimestamp = new Date();
            this.sessions[sid] = newSession;
            returnObject.SDP = newSession.remoteSDP.raw;
            returnObject.mediaType = mediaType;
            break;
        case 'session-accept':
            session.handleSessionAccept(stanza.getChild('jingle'));

            returnObject.SDP = session.remoteSDP.raw;
            returnObject.mediaType = session.mediaType;

            this.sessions[sid] = session;
            break;
        case 'session-terminate':
            returnObject.mediaType = session.mediaType;
            session.handleSessionTerminate(stanza.getChild('jingle'));
            //console.log(" ****** DELETE JINGLE SESSION with SID : " + sid + " ******");
            this.deleteSessionBySid(sid);
            break;
        case 'transport-info':
            returnObject.candidates = session.handleTransportInfo(stanza.getChild('jingle').getChildren('content'));
            this.sessions[sid] = session;
            returnObject.mediaType = session.mediaType;
            break;
        case 'transport-replace':
            //console.log(" ****** TRANSPORT REPLACE ******");
            session.handleTransportReplace(stanza.getChild('jingle'));
            returnObject.SDP = session.remoteSDP.raw;
            returnObject.mediaType = session.mediaType;
            this.sessions[sid] = session;
            break;
        case 'content-add':
            //console.log(" ****** CONTENT ADD ******");
            session.handleContentAdd(stanza.getChild('jingle'));
            returnObject.SDP = session.remoteSDP.raw;
            returnObject.mediaType = session.mediaType;
            this.sessions[sid] = session;
            break;
        case 'content-modify':
            //console.log(" ****** CONTENT MODIFY ******");
            session.handleContentModify(stanza.getChild('jingle'));
            returnObject.SDP = session.remoteSDP.raw;
            returnObject.mediaType = session.mediaType;
            this.sessions[sid] = session;
            break;
            //EBR200218+
        case 'transport-accept':
            session.handleTransportAccept(stanza.getChild('jingle'));

            returnObject.SDP = session.remoteSDP.raw;
            returnObject.mediaType = session.mediaType;

            this.sessions[sid] = session;
            break;
            //EBR200218-
        case 'session-info':
            returnObject.event = session.handleSessionInfo(stanza.getChild('jingle'));
            this.sessions[sid] = session;
            break;
        default:
            break;
        }

        returnObject.processed = true;
        returnObject.ack = ack;

        return returnObject;
    }
}

function createJingleService() {
    return new JingleService();
}

module.exports.createJingleService = createJingleService;
module.exports.JingleService = JingleService;

export {createJingleService, JingleService};
