"use strict";
import {accessSync} from "fs";
import {XMPPService} from "../XMPPService";
import {WebRtcService} from "../../services/WebRtcService";

export {};


//const Utils = require("../../common/Utils");
const GenericHandler = require("./genericHandler");
//const Conversation = require("../../common/models/Conversation");
//const NameUpdatePrio = require("../../common/models/Contact").NameUpdatePrio;
/*const moment = require("moment");
const Deferred = require("../../common/Utils").Deferred;
const CallLog = require("../../common/models/CallLog");

const xml = require("@xmpp/xml");
const PromiseQueue = require("../../common/promiseQueue");

const config = require("../../config/config");
*/
import {xu} from "../../common/XMPPUtils";
//import {IQJingleParser} from "../WebRtc/IqJingleParser";
import {createJingleService, JingleService} from "../WebRtc/JingleService";
import {stringify} from "querystring";

const LOG_ID = "XMPP/HNDL/WEBRTC - ";

/*********************************************************************/
/** PRIVATE CONSTRUCTOR                                             **/
/*********************************************************************/

class WebRtcEventHandler extends GenericHandler {
	public MESSAGE: any;
	public IQ_RESULT: any;
	public IQ_ERROR: any;
	public IQ_CALLLOG: any;
	public _webrtcService: WebRtcService;
	public _profileService: any;
	public logger: any;
    public IQ_SET: string;
    //private _iqJingleParser: IQJingleParser;

    private readonly _jingleService: JingleService;

    constructor(xmppService : XMPPService, webrtcService,  profileService) {
        super(xmppService);

        this.MESSAGE = "jabber:client.message";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        this.IQ_CALLLOG = "jabber:iq:telephony:call_log";
        this.IQ_SET = "jabber:client.iq.set";

        this._webrtcService = webrtcService;
        this._profileService = profileService;

        //this.promiseQueue = PromiseQueue.createPromiseQueue(that.logger);
        this.logger.log("internal", LOG_ID + "(constructor) ");

        // C:\Projets\RandD\Rainbow\Sources\CPaas\Rainbow-Node-SDK - sample2\node_modules\ltx\lib\Element.js
        this._jingleService = createJingleService();
        //this._iqJingleParser = new IQJingleParser(this.xmppService, {} /* this._janusService */, {}/*this._sipMemoryService */, this._jingleService, this.logger);
    }

    async onSetStanza(msg, stanza) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onIqReceived) received - 'stanza'", msg, stanza);
        try
        {
            let parsed : {jid_from:string, jid_to : string,  id : string} = {jid_from: "", jid_to : "",  id : ""};
            parsed.jid_from = stanza.attr('from');
            parsed.jid_to = stanza.attr('to');
            parsed.id = stanza.attr('id');

            /*
            let directXmppServiceRq = stanza.getChild('mediapillar');

            if(directXmppServiceRq)
            {
                return this._iqDirectXmpp.onSetStanza(parsed, stanza);
            } // */

            let jingleRq = stanza.getChild('jingle');

            if(jingleRq)
            {
                //let setStanza = await this._iqJingleParser.onSetStanza(parsed, stanza);
                let setStanza = await that.onSetStanzaTreatment(parsed, stanza);

                return setStanza;
                //return this._iqJingleParser.onSetStanza(parsed, stanza);
            }

            super._onSetStanza(parsed, stanza);
        }
        catch(err)
        {
            that.logger.log("error", LOG_ID + "Catch Error!!! Iq Error occurred while parsing stanza.");
            that.logger.log("internalerror", LOG_ID + "Catch Error !!! Iq Error occurred while parsing stanza", stanza,". Err: ",  err);
            return true;
        }
    }
    public onSetStanzaTreatment(parsed, stanza)
    {
        this.logger.log("debug", LOG_ID +'(onSetStanzaTreatment)  ', stanza.toString());

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

                this.logger.log("debug", LOG_ID +'(onSetStanzaTreatment) last case ', JSON.stringify(res));

                return res;
            })
            .catch((err) =>
            {
                this.logger.log("internalerror", LOG_ID +"(onSetStanzaTreatment) IqJingleParser Error occurred while parsing stanza : ", stanza.toString(), ", message : ", err.message);
                //this.logger.log("internalerror", LOG_ID +"%s Error, STACK TRACE : %s ",LOG_ID , this.getstack (arguments.callee.caller));
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
        let that = this;

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

        that.logger.log("debug", LOG_ID +'(_onParseJingleInitiateRequest) : ', stanza.toString());
        that.logger.log("info", LOG_ID +'(_onParseJingleInitiateRequest), Receive session-initiate message from : ', JSON.stringify(parsed.jid_from));

        let res = that._jingleService.handleIqStanza(stanza);

        try {
            await that.xmppService.xmppClient.send(res.ack); //just to close the 'session-initiate' transaction
        } catch (err) {
            that.logger.log("internalerror", LOG_ID + '(_onParseJingleInitiateRequest) Catch Error !!! : ', err);
        }
        if(!res.processed)
        {
            that.logger.log("warn", LOG_ID + '(_onParseJingleInitiateRequest) cannot process the request : ', JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }
        that.logger.log("debug", LOG_ID + '(_onParseJingleInitiateRequest) Client SDP : ', JSON.stringify(res));

        //TODO  jingle session accept

        that.logger.log("debug", LOG_ID + '(_onParseJingleInitiateRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));


        that.logger.log("info", LOG_ID + "(onSetStanza)  - send evt_internal_InitiateRequest 'res'", res);
        that.eventEmitter.emit("evt_internal_InitiateRequest", res);


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

            this.logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIP Janus response  \'%s\' ', LOG_ID, JSON.stringify(session));

            let state = session.data.result.event

            //let JanusSDP = session.response.jsep ? session.response.jsep.sdp : '';

            this.logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest jid \'%s\', confIf \'%s\', mediaType \'%s\' ', LOG_ID, this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

            let SIDs = this._jingleService.getSession(this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

            this.logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIDs \'%s\'', LOG_ID, JSON.stringify(SIDs));

            //let sid = SIDs[0];
            /* server side: server sends 'ringing' */
            //let stanzaSessionRinging = this._jingleService.sessions[sid].sessionRinging(XmppWriter.genId());
            //await this.xmppService.xmppClient.send(stanzaSessionRinging);

            /* server side: server accepts the session */
            /* let stanzaSessionAccept = this._jingleService.sessions[sid].sessionAccept(XmppWriter.genId(), JanusSDP.toString());
            //TODO we need to wait for the ACK for the SessionAccept IQ
            await this.xmppService.xmppClient.send(stanzaSessionAccept);
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

        this.logger.log("debug", LOG_ID +'(_onParseTransportInfoRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseTransportInfoRequest) Receive transport-info message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //just to close the 'transport-info' transaction

        if(!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseTransportInfoRequest) cannot process transport-info request from : ', LOG_ID, JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseTransportInfoRequest) cannot process the request : ', JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this.logger.log("debug", LOG_ID +'(_onParseTransportInfoRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));

        this.logger.log("info", LOG_ID + "(_onParseTransportInfoRequest)  - send evt_internal_TransportInfoRequest 'res'", res);
        this.eventEmitter.emit("evt_internal_TransportInfoRequest", res);

        return ;
        
        if (res.mediaType !== 'sip' || !res.candidates[0]) {
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }
        this.logger.log("info", LOG_ID +'(_onParseTransportInfoRequest) candidate', res.candidates[0].candidate);

        let session = this._sipMemoryService.getSession(this._toBareJid(parsed.jid_from));

        if(session && !(res.candidates[0].candidate.includes("typ srflx"))) {

            return this._janusService.trickle(session.backendSessionId, session.handleId, res.candidates[0]).then((result) => {
                this.logger.log("debug", LOG_ID +'(_onParseTransportInfoRequest) result : ', JSON.stringify(result));
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

        this.logger.log("debug", LOG_ID +'(_onParseJingleTerminateRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseJingleTerminateRequest) Receive session-terminate message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //just to close the 'session-terminate' transaction

        if(!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseJingleTerminateRequest) Cannot process session-terminate request from : ', JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseJingleTerminateRequest) cannot process the request : ', JSON.stringify(stanza));

            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this.logger.log("debug", LOG_ID +'(_onParseJingleTerminateRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));

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
                    //this.logger.log("debug", LOG_ID +'%s STARTCONFERENCE', LOG_ID);
                    this.logger.log("debug", LOG_ID +'%s: $$$$$$ SIP RESPONSE TO RELEASE CALL REQUEST for user : %s', LOG_ID, parsed.releaseCallReq.userName);
                    await this.xmppService.xmppClient.send(response);

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

                this.logger.log("debug", LOG_ID +'(_onParseJingleTerminateRequest) SIP RELEASE CALL');

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

        this.logger.log("debug", LOG_ID +'(_onParseSessionAcceptRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseSessionAcceptRequest) Receive session-accept message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //just to close the 'session-accept' transaction

        if(!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseSessionAcceptRequest) Cannot process session-accept request from : ', JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseSessionAcceptRequest) cannot process the request : ', JSON.stringify(stanza));

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

            this.logger.log("debug", LOG_ID +'(_onParseSessionAcceptRequest) SIP Janus response : ', JSON.stringify(session));

            let tricklesP = [];
            for(let i = 0; i < delayedCandidates.length; i++)
            {
                tricklesP.push(
                    self._janusService.trickle(tmpSession.backendSessionId, tmpSession.handleId, delayedCandidates[i]).then((result) =>
                    {
                        self.logger.log("info", LOG_ID +'(_onParseSessionAcceptRequest) delayed audio candidate treated : ', JSON.stringify(result));
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
            this.logger.log("internalerror", LOG_ID +'(_onParseTransportReplaceRequest) Jingle stanza not found! : ', JSON.stringify(stanza));
            return new Promise((resolve, reject) =>
            {
                resolve(false);
            });
        }

        let jingleAction = jingleStanza.attr('action');
        if (jingleAction != 'transport-replace')
        {
            //this.logger.log("internalerror", LOG_ID +'%s _onParseTransportReplaceRequest Action isn\'t \'transport-replace\'! %s', LOG_ID, JSON.stringify(stanza));
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

        this.logger.log("debug", LOG_ID +'(_onParseTransportReplaceRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseTransportReplaceRequest) Receive transport-replace message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseTransportReplaceRequest) Cannot process transport-replace request from : ', JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseTransportReplaceRequest) Cannot process the request! : ', JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this.logger.log("debug", LOG_ID +'(_onParseTransportReplaceRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));

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

            this.logger.log("debug", LOG_ID +'(_onParseTransportReplaceRequest) SIP Janus response : ', JSON.stringify(session));

            let state = session.data.result.event

            //let JanusSDP = session.response.jsep ? session.response.jsep.sdp : '';

            this.logger.log("debug", LOG_ID +'(_onParseTransportReplaceRequest) jid : \'', this._toBareJid(parsed.jid_from), '\', confIf : \'', tmpSession.calledNumber, '\', mediaType : \'', res.mediaType, '\' ' );

            //let SIDs = this._jingleService.getSession(this._toBareJid(parsed.jid_from), tmpSession.calledNumber, res.mediaType);

            //this.logger.log("debug", LOG_ID +'%s: _onParseJingleInitiateRequest SIDs \'%s\'', LOG_ID, JSON.stringify(SIDs));

            //let sid = SIDs[0];
            /* server side: server sends 'ringing' */
            //let stanzaSessionRinging = this._jingleService.sessions[sid].sessionRinging(XmppWriter.genId());
            //await this.xmppService.xmppClient.send(stanzaSessionRinging);

            /* server side: server accepts the session */
            /* let stanzaSessionAccept = this._jingleService.sessions[sid].sessionAccept(XmppWriter.genId(), JanusSDP.toString());
             //TODO we need to wait for the ACK for the SessionAccept IQ
             await this.xmppService.xmppClient.send(stanzaSessionAccept);
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
            this.logger.log("internalerror", LOG_ID +'(_onParseContentAddRequest) Jingle stanza not found! : ', JSON.stringify(stanza));
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

        this.logger.log("debug", LOG_ID +'(_onParseContentAddRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseContentAddRequest) Receive content-add message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseContentAddRequest) Cannot process content-add request from %: ', JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseContentAddRequest) Cannot process the request! : ', JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this.logger.log("debug", LOG_ID +'(_onParseContentAddRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));

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

            this.logger.log("debug", LOG_ID +'(_onParseContentAddRequest) SIP Janus response : ', JSON.stringify(session));

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
            this.logger.log("internalerror", LOG_ID +'(_onParseContentModifyRequest) Jingle stanza not found! : ', JSON.stringify(stanza));
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

        this.logger.log("debug", LOG_ID +'(_onParseContentModifyRequest) stanza : ', stanza.toString());
        this.logger.log("info", LOG_ID +'(_onParseContentModifyRequest) Receive content-modify message from : ', JSON.stringify(parsed.jid_from));

        let res = this._jingleService.handleIqStanza(stanza);

        await this.xmppService.xmppClient.send(res.ack); //Just to close the 'transport-replace' transaction.

        if (!res.processed)
        {
            this.logger.log("warn", LOG_ID +'(_onParseContentModifyRequest) Cannot process content-modify request from %s', JSON.stringify(parsed.jid_from));
            this.logger.log("debug", LOG_ID +'(_onParseContentModifyRequest) Cannot process the request! %s', JSON.stringify(stanza));
            //TODO tanton 25/08/2017: not sure what is right to return - true or false
            return new Promise((resolve, reject) =>
            {
                resolve(true);
            });
        }

        this.logger.log("debug", LOG_ID +'(_onParseContentModifyRequest) Try to find : ', JSON.stringify(this._toBareJid(parsed.jid_from)));

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

            this.logger.log("debug", LOG_ID +'(_onParseContentModifyRequest) SIP Janus response : ', JSON.stringify(session));

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
    //         this.logger.log("internalerror", LOG_ID +"%s Error occurred while parsing error stanza %s. Err: ", LOG_ID, parsed.id, err.toString());
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

    onMessageReceived (msg, stanza) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onMessageReceived) received - 'stanza'", msg, stanza);
        try {
            that.logger.log("debug", LOG_ID + "(onMessageReceived) _entering_");
            that.logger.log("internal", LOG_ID + "(onMessageReceived) _entering_", msg, stanza);

            let regex1 = new RegExp( /jabber:client.message$/, "g" );
            if (msg && !regex1.test(msg)) {
                that.logger.log("debug", LOG_ID + "(onMessageReceived) _exiting_");
                return ;
            }
            let children = stanza.children;
            let to = stanza.attrs.from;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "retract":
                    case "delay":
                        break;
                    case "propose":
                        that.onProposeMessageReceived(node, to);
                        break;
                    default:
                        that.logger.log("error", LOG_ID + "(onMessageReceived) unmanaged management message node " + node.getName());
                        break;
                }
            });
        } catch (error) {
            that.logger.log("error", LOG_ID + "(onMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onMessageReceived) CATCH Error !!! : ", error);
            return true;
        }

        return true;
    };

    onProposeMessageReceived (node, to) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onProposeMessageReceived) node - ", node);

        let fullto = to;
        let bareto = xu.getBareJIDFromFullJID(fullto);

        let callId = node.attrs.id;
        //let jid =  node.

        that.logger.log("internal", LOG_ID + "(onProposeMessageReceived) | acceptProposition for callId : ", callId);
        that.logger.log("internal", LOG_ID + "(onProposeMessageReceived) | acceptProposition for bareto : ", bareto);
        //send accept to my ressources
        //that.xmppService.acceptProposition(callId, bareto);
        that.xmppService.proceedProposition(callId, bareto);
        //that.xmppService.setPresence("dnd","audio");
    }
}

export {WebRtcEventHandler};
module.exports.WebRtcEventHandler = WebRtcEventHandler;
