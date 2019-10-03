/**
 * Created by tanton on 04/08/17.
 */


'use strict';
import {publicDecrypt} from "crypto";

export {};

// @ts-ignore
const path = require('path');

// @ts-ignore
//const PortalCommon = require(path.join(__dirname, '..', 'Common', 'commonportal', 'otlite-portal-common.js'));
// @ts-ignore
const EventEmitter = require('events');
/*const ConferencesModel = PortalCommon.Models.ConferencesModel;
// @ts-ignore
const XmppWriter = PortalCommon.XmppHelper.Writer;
// @ts-ignore
const XmppParser = PortalCommon.XmppHelper.Parser;

const CommonIq = PortalCommon.XmppHelper.Iq;

// @ts-ignore
const CommonMsg = PortalCommon.XmppHelper.Message;
*/
const STARTCONFERENCE_REQ        = module.exports.STARTCONFERENCE_REQ          = Symbol('STARTCONFERENCE_REQ');
const STOPCONFERENCE_REQ         = module.exports.STOPCONFERENCE_REQ           = Symbol('STOPCONFERENCE_REQ');
const JOINCONFERENCE_REQ         = module.exports.JOINCONFERENCE_REQ           = Symbol('JOINCONFERENCE_REQ');

const BACKEND_REQ_ERROR        = module.exports.BACKEND_REQ_ERROR         = Symbol("BACKEND_REQ_ERROR");

//const JanusEvent = require('../Janus/JanusEvent');

import {XmppClient} from "../../common/XmppQueue/XmppClient";
import {XMPPService} from "../XMPPService";

// @ts-ignore
const LOG_ID = 'JINGLEPARSER/IQ - ';


class IQJingleParser
{
    private _logger: any;
    private _xmppService : XMPPService;
    private _janusService: any;
    private _emitter: any;
    private _jingleService: any;
    private _sipMemoryService: any;

    constructor(xmppService, janusService, sipMemoryService, jingleService, logger)
    {
        this._xmppService = xmppService;
        this._janusService =  janusService;
        this._logger = logger;
        this._emitter = new EventEmitter();

        this._jingleService = jingleService;
        this._sipMemoryService = sipMemoryService;
    }

    public onSetStanza(parsed, stanza)
    {
        this._logger.log("debug", LOG_ID +'%s:  onSetStanza %s ', LOG_ID, stanza.toString());

        let serviceRq = stanza.getChild('jingle');

        return this._onParseJingleInitiateRequest(parsed, stanza).then((result) =>
        {
            if (result)
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(true);
                });
            }
            else
            {
                return result;
            }
        })
        .then((res) =>
        {
            if(!res)
            {
                return this._onParseTransportInfoRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {
                        //this._emitter.emit(JOINCONFERENCE_REQ, parsed);

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        }) //EBR Replace+
        .then((res) =>
        {
            if(!res)
            {
                return this._onParseTransportReplaceRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {
                        //this._emitter.emit(JOINCONFERENCE_REQ, parsed);

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        })   //EBR Replace-
        .then((res) =>
        {
            if(!res)
            {
                return this._onParseJingleTerminateRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {
                        //this._emitter.emit(JOINCONFERENCE_REQ, parsed);

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        }).
        then((res) =>
        {
            if(!res)
            {
                return this._onParseSessionAcceptRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {
                        //this._emitter.emit(JOINCONFERENCE_REQ, parsed);

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        }).
        then((res) =>
        {
            if(!res)
            {
                return this._onParseContentAddRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        }).
        then((res) =>
        {
            if(!res)
            {
                return this._onParseContentModifyRequest(parsed, stanza).then((result) =>
                {
                    if (result)
                    {

                        return new Promise((resolve, reject) =>
                        {
                            resolve(true);
                        });
                    }
                    else
                    {
                        return result;
                    }
                });
            }
            else
            {
                return new Promise((resolve, reject) =>
                {
                    resolve(res);
                });
            }
        }).
        then((res) =>
        {
            //TODO tanton 21/07/2012: obviously this is not the right way to return here !
            // if(!res)
            //     return super._onSetStanza(parsed, stanza);
            // else

            this._logger.log("debug", LOG_ID +'%s:  onSetStanza last case  %s ', LOG_ID, JSON.stringify(res));

            return res;
        })
        .catch((err) =>
         {
             this._logger.log("internalerror", LOG_ID +"%s IqJingleParser Error occurred while parsing stanza %s , message : %s", LOG_ID, stanza.toString(), err.message);
             //this._logger.log("internalerror", LOG_ID +"%s Error, STACK TRACE : %s ",LOG_ID , this.getstack (arguments.callee.caller));
             return true;
         });
    }

    getstack(p_caller) {
        var curr  = undefined;
        var stack = [];
        var e : any ={};
        var call_stackresult = {};


        try {
            e = new Error();
            if (e.stack) {
                call_stackresult["internal_stack"] = e.stack;
            }
        } catch (err) {
        }

        try {
            var FUNC  = 'function', ANON = "{anonymous}",
                fnRE  = /function\s*([\w\-$]+)?\s*\(/i,
                j = stack.length,
                fn,args,i;

            var nbMethodsMax = 5;
            var iterNbMethods = 1;

            if (p_caller) {
                curr = p_caller.arguments.callee;
            } else {
                curr = arguments.callee.caller;
            }

            while (curr != undefined ) {
                if (iterNbMethods >= nbMethodsMax) {
                    break;
                }

                var currString = curr.toString();
                //this.log("debug", LOG_ID +"logger","currString : " + currString);
                fn    = fnRE.test(currString) ? RegExp.$1 || ANON : ANON;
                if (curr.arguments) {
                    args  = stack.slice.call(curr.arguments);
                    i     = args.length;

                    while (i--) {
                        switch (typeof args[i]) {
                            case 'string'  : args[i] = '"'+args[i].replace(/"/g,'\\"')+'"'; break;
                            case 'function': args[i] = FUNC; break;
                        }
                    }

                    stack[j++] = fn + '(...)';//'(' + args.join() + ')';
                } else {
                    stack[j++] = fn + '()';
                }
                if ( !curr.caller ) {
                    curr = undefined;
                } else {
                    curr = curr.caller;
                }
                iterNbMethods++;
            }

        } catch (err) {

        }
        call_stackresult["calculated_stack"] = stack;
        return call_stackresult;
    };

    async _onParseJingleInitiateRequest(parsed, stanza)
    {

        let jingleStanza    = stanza.getChild('jingle');
        let jingleAction      = jingleStanza.attr('action');

        if (!jingleStanza)
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        if (jingleAction != 'session-initiate')
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'(_onParseJingleInitiateRequest) : ', stanza.toString());
        this._logger.log("info", LOG_ID +'(_onParseJingleInitiateRequest), Receive session-initiate message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //just to close the 'session-initiate' transaction

        if(!res.processed)
        {
            this._logger.log("warn", LOG_ID + '(_onParseJingleInitiateRequest) cannot process the request : ', JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }
        this._logger.log("debug", LOG_ID + '(_onParseJingleInitiateRequest) Client SDP : ', JSON.stringify(res));

        //TODO  jingle session accept

        this._logger.log("debug", LOG_ID + '(_onParseJingleInitiateRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));




return res;

        let tmpSession;
        //EBR SIP+
            // SIP treatment

            tmpSession = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

             if ( stanza.getChild('jingle').getChild('mediapillar').getChild('callednumber') !== undefined )
             {
                 //let callednbtag = stanza.getChild('jingle').getChild('callednumber') ;
                 //let callednbtag = stanza.getChild('jingle').getChild('callednumber') ;
                 let callednumber = stanza.getChild('jingle').getChild('mediapillar').getChild('callednumber').text();

                 tmpSession.calledNumber = callednumber ;// attr('id'); //EBR1611
             }

            return this._janusService.sipMakeCall(tmpSession.calledNumber, tmpSession.displayName, tmpSession.backendSessionId, tmpSession.handleId, res.SDP, res.mediaType).then((session) =>
            {

                this._logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

                let state = session.data.result.event

                //let JanusSDP = session.response.jsep ? session.response.jsep.sdp : '';

                this._logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest jid \'%s\', confIf \'%s\', mediaType \'%s\' ', LOG_ID, this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

                let SIDs = this._jingleService.getSession(this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

                this._logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIDs \'%s\'', LOG_ID, JSON.stringify(SIDs));

                //let sid = SIDs[0];
                /* server side: server sends 'ringing' */
                //let stanzaSessionRinging = this._jingleService.sessions[sid].sessionRinging(XmppWriter.genId());
                //await this._xmppService.xmppClient.send(stanzaSessionRinging);

                /* server side: server accepts the session */
                /* let stanzaSessionAccept = this._jingleService.sessions[sid].sessionAccept(XmppWriter.genId(), JanusSDP.toString());
                //TODO we need to wait for the ACK for the SessionAccept IQ
                await this._xmppService.xmppClient.send(stanzaSessionAccept);
// */
                return new Promise((resolve, reject) =>
                {
                    resolve(true);
                });

            });

        //EBR SIP-
    }

    async _onParseTransportInfoRequest(parsed, stanza)
    {
        let jingleStanza = stanza.getChild('jingle');
        let jingleAction = jingleStanza.attr('action');

        if (!jingleStanza)
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        if (jingleAction != 'transport-info')
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'%s:  _onParseTransportInfoRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive transport-info message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //just to close the 'transport-info' transaction

        if(!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process transport-info request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s: _onParseTransportInfoRequest cannot process the request \'%s\' ', LOG_ID, JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this._logger.log("debug", LOG_ID +'%s: Try to find  \'%s\' ', LOG_ID, JSON.stringify(this._toBareJid(parsed.jid_from)));


        if (res.mediaType !== 'sip' || !res.candidates[0]) {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }
        this._logger.log("info", LOG_ID +'%s:     %s', LOG_ID, res.candidates[0].candidate);

        let session = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

        if(session && !(res.candidates[0].candidate.includes("typ srflx"))) {

            return this._janusService.trickle(session.backendSessionId, session.handleId, res.candidates[0]).then((result) => {
                this._logger.log("debug", LOG_ID +'%s: _onParseTransportInfoRequest result: \'%s\' ', LOG_ID, JSON.stringify(result));
                return new Promise((resolve, reject) =>
                {
                    resolve(true);
                });
            });
        } else {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }
    }

    async _onParseJingleTerminateRequest(parsed, stanza)
    {
        let jingleStanza = stanza.getChild('jingle');
        let jingleAction = jingleStanza.attr('action');

        if (!jingleStanza)
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        if (jingleAction != 'session-terminate')
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'%s:  _onParseJingleTerminateRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive session-terminate message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //just to close the 'session-terminate' transaction

        if(!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process session-terminate request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s: _onParseJingleTerminateRequest cannot process the request \'%s\' ', LOG_ID, JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this._logger.log("debug", LOG_ID +'%s: Try to find  \'%s\' ', LOG_ID, JSON.stringify(this._toBareJid(parsed.jid_from)));

          if(res.mediaType == 'sip') {
            //First, check if SIP session exist
            let session = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

            if(session){

            return this._janusService.sipReleaseCall(session.backendSessionId, session.handleId).then((callReleased) => {

                    /* Do not send this hangingup message !
                    //Warning: We only get the "hangingup" session state

                    var response = XmppWriter.createStanza(CommonIq.STANZA_NAME,
                        {
                            to: parsed.jid_from,
                            from: parsed.jid_to,
                            type: CommonIq.RESULT_STANZA_TYPE,
                            id: parsed.id,
                            xmlns: 'jabber:client'
                        });

                    response.c('confservice',
                        {
                            xmlns: 'urn:xmpp:janusagent:confservice:1'
                        })
                        .c('releaseCall')
                        .c('jidIm').t(parsed.releaseCallReq.jidIm).up()
                        .c('jidTel').t(parsed.releaseCallReq.jidTel).up()
                        .c('userName').t(parsed.releaseCallReq.userName).up()
                        .c('status').t(callReleased.data.result.event).up()
                    //.c('code').t(callReleased.data.result.code).up()
                    //.c('reason').t(callReleased.data.result.reason).up()
                        .c('backendSessionId').t(callReleased.sessionId).up()
                        .c('audioMasterHandleId').t(callReleased.handleId).up();

                    //var response = this._requestManager.set(request.attrs.id, request);
                    //this._logger.log("debug", LOG_ID +'%s STARTCONFERENCE', LOG_ID);
                    this._logger.log("debug", LOG_ID +'%s: $$$$$$ SIP RESPONSE TO RELEASE CALL REQUEST for user : %s', LOG_ID, parsed.releaseCallReq.userName);
                    await this._xmppService.xmppClient.send(response);

                    */

                    //NONNNNNNNN Remove the session ===> On doit garder la session (contient l'info de registration) , par contre, on remet l'état de la session à Init
                    //this._sipMemoryService.removeSession(parsed.releaseCallReq.jidIm);

                    //TODO: Mais alors a quel moment on détruit la session !!!!! (ou alors état registration indépendant de la session)
                    this._sipMemoryService.updateSessionState(this._toBareJid(parsed.jid_from),'init');

                    return new Promise((resolve, reject) =>
                    {
                        resolve(true);
                    });
                });

                this._logger.log("debug", LOG_ID +'%s:  SIP RELEASE CALL', LOG_ID);

            } else{
                //TODO: Session doesn't exist , send an error response
                return new Promise((resolve, reject) =>
                {
                    resolve(false);
                });

            }

        }
    }

    async _onParseSessionAcceptRequest(parsed, stanza)
    {
        let self = this;
        let jingleStanza = stanza.getChild('jingle');
        let jingleAction = jingleStanza.attr('action');

        if (!jingleStanza)
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        if (jingleAction != 'session-accept')
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'%s:  _onParseSessionAcceptRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive session-accept message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //just to close the 'session-accept' transaction

        if(!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process session-accept request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s: _onParseSessionAcceptRequest cannot process the request \'%s\' ', LOG_ID, JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        let jingleSid = jingleStanza.attr('sid');
        let delayedCandidates = self._jingleService.sessions[jingleSid].getDelayedCandidates();

        //if sip
        let tmpSession = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

        return this._janusService.sipAcceptCall(tmpSession.backendSessionId, tmpSession.handleId, res.SDP).then((session) =>
        {

            this._logger.log("debug", LOG_ID +'%s: _onParseJingleAcceptRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

                    let tricklesP = [];
                    for(let i = 0; i < delayedCandidates.length; i++)
                    {
                        tricklesP.push(
                            self._janusService.trickle(tmpSession.backendSessionId, tmpSession.handleId, delayedCandidates[i]).then((result) =>
                            {
                                self._logger.log("info", LOG_ID +'%s: _onParseSessionAcceptRequest delayed audio candidate: \'%s\' treated', LOG_ID, JSON.stringify(result));
                                return true;
                            })
                        );
                    }
                    self._jingleService.sessions[jingleSid].deleteDelayedCandidates();
                    return Promise.all(tricklesP).then(() =>
                    {
                        return true;
                    });
        });
    }

    //EBR Replace+
    async _onParseTransportReplaceRequest(parsed, stanza)
    {
        let jingleStanza = stanza.getChild('jingle');
        if (!jingleStanza)
        {
            this._logger.log("internalerror", LOG_ID +'%s _onParseTransportReplaceRequest Jingle stanza not found! %s', LOG_ID, JSON.stringify(stanza));
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        let jingleAction = jingleStanza.attr('action');
        if (jingleAction != 'transport-replace')
        {
            //this._logger.log("internalerror", LOG_ID +'%s _onParseTransportReplaceRequest Action isn\'t \'transport-replace\'! %s', LOG_ID, JSON.stringify(stanza));
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        /*
        let serviceRq = undefined;
        if ( stanza.getChild('jingle').getChild('mediapillar', 'urn:xmpp:janus:1') !== undefined )
        {
            serviceRq = stanza.getChild('jingle').getChild('mediapillar', 'urn:xmpp:janus:1');
            parsed.confId = serviceRq.attr('id');
        }
        else
        {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }
        */

        this._logger.log("debug", LOG_ID +'%s:  _onParseTransportReplaceRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive transport-replace message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process transport-replace request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s _onParseTransportReplaceRequest Cannot process the request! %s', LOG_ID, JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this._logger.log("debug", LOG_ID +'%s: Try to find  \'%s\' ', LOG_ID, JSON.stringify(this._toBareJid(parsed.jid_from)));

        let tmpSession = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));
        //let tmpParticipant = this._memoryService.getParticipant(this._toBareJid(parsed.jid_from));

        if ((!tmpSession) || (tmpSession.state !=='active'))
        {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        return this._janusService.sipUpdateCall(tmpSession.backendSessionId, tmpSession.handleId, res.SDP, res.mediaType).then((session) =>
        {

            this._logger.log("debug", LOG_ID +'%s: _onParseTransportReplaceRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

            let state = session.data.result.event

            //let JanusSDP = session.response.jsep ? session.response.jsep.sdp : '';

            this._logger.log("debug", LOG_ID +'%s: _onParseTransportReplaceRequest jid \'%s\', confIf \'%s\', mediaType \'%s\' ', LOG_ID, this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

            //let SIDs = this._jingleService.getSession(this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

            //this._logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIDs \'%s\'', LOG_ID, JSON.stringify(SIDs));

            //let sid = SIDs[0];
            /* server side: server sends 'ringing' */
            //let stanzaSessionRinging = this._jingleService.sessions[sid].sessionRinging(XmppWriter.genId());
            //await this._xmppService.xmppClient.send(stanzaSessionRinging);

            /* server side: server accepts the session */
            /* let stanzaSessionAccept = this._jingleService.sessions[sid].sessionAccept(XmppWriter.genId(), JanusSDP.toString());
             //TODO we need to wait for the ACK for the SessionAccept IQ
             await this._xmppService.xmppClient.send(stanzaSessionAccept);
             // */
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });

        });
    }

    async _onParseContentAddRequest(parsed, stanza)
    {
        let jingleStanza = stanza.getChild('jingle');
        if (!jingleStanza)
        {
            this._logger.log("internalerror", LOG_ID +'%s _onParseContentAddRequest Jingle stanza not found! %s', LOG_ID, JSON.stringify(stanza));
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        let jingleAction = jingleStanza.attr('action');
        if (jingleAction != 'content-add' )
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'%s:  _onParseContentAddRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive content-add message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process content-add request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s _onParseContentAddRequest Cannot process the request! %s', LOG_ID, JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this._logger.log("debug", LOG_ID +'%s: Try to find  \'%s\' ', LOG_ID, JSON.stringify(this._toBareJid(parsed.jid_from)));

        let tmpSession = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

        if ((!tmpSession) || (tmpSession.state !=='active'))
        {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        return this._janusService.sipUpdateCall(tmpSession.backendSessionId, tmpSession.handleId, res.SDP, res.mediaType).then((session) =>
        {

            this._logger.log("debug", LOG_ID +'%s:_onParseContentAddRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });

        });
    }

    async _onParseContentModifyRequest(parsed, stanza)
    {
        let jingleStanza = stanza.getChild('jingle');
        if (!jingleStanza)
        {
            this._logger.log("internalerror", LOG_ID +'%s _onParseContentModifyRequest Jingle stanza not found! %s', LOG_ID, JSON.stringify(stanza));
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        let jingleAction = jingleStanza.attr('action');
        if (jingleAction != 'content-modify' )
        {
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        this._logger.log("debug", LOG_ID +'%s:  _onParseContentModifyRequest %s ', LOG_ID, stanza.toString());
        this._logger.log("info", LOG_ID +'%s: Receive content-modify message from %s', LOG_ID, JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this._xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this._logger.log("warn", LOG_ID +'%s: Cannot process content-modify request from %s', LOG_ID, JSON.stringify(parsed.jid_from));
            this._logger.log("debug", LOG_ID +'%s _onParseContentModifyRequest Cannot process the request! %s', LOG_ID, JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this._logger.log("debug", LOG_ID +'%s: Try to find  \'%s\' ', LOG_ID, JSON.stringify(this._toBareJid(parsed.jid_from)));

        let tmpSession = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

        if ((!tmpSession) || (tmpSession.state !=='active'))
        {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        return this._janusService.sipUpdateCall(tmpSession.backendSessionId, tmpSession.handleId, res.SDP, res.mediaType).then((session) =>
        {

            this._logger.log("debug", LOG_ID +'%s:_onParseContentModifyRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });

        });
    }
    //EBR Replace-

    // _onErrorStanza(parsed, stanza)
    // {
    //     try
    //     {
    //         let backendError = stanza.getChild('error');
    //
    //         parsed.jid_from = stanza.attr('from');
    //         parsed.jid_to   = stanza.attr('to');
    //
    //         if (this._onParseBackendReqError(parsed, backendError))
    //         {
    //             this._emitter.emit(BACKEND_REQ_ERROR, parsed);
    //             return this._requestManager.onError(parsed.id, parsed)
    //         }
    //
    //         return super._onErrorStanza(parsed, stanza);
    //     }
    //     catch(err)
    //     {
    //         this._logger.log("internalerror", LOG_ID +"%s Error occurred while parsing error stanza %s. Err: ", LOG_ID, parsed.id, err.toString());
    //
    //         return this._requestManager.onError(parsed.id, err);
    //     }
    // }

    _toBareJid(jid)
    {
        let slash = '/';

        let res =  jid ? jid.split(slash): [""];

        return res[0];
    }

}

module.exports.Helper = IQJingleParser;
module.exports.IQJingleParser = IQJingleParser;
export {IQJingleParser};

