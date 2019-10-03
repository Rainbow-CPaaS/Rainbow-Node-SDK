'use strict';

// @ts-ignore
const path = require('path');
// @ts-ignore
const PortalCommon = require("../../Modules/Common/commonportal/otlite-portal-common.js");
// @ts-ignore
const EventEmitter = require('events');

// @ts-ignore
const CommonMsg = PortalCommon.XmppHelper.Message;
const CommonPres = PortalCommon.XmppHelper.Presence;
// @ts-ignore
const XmppWriter = PortalCommon.XmppHelper.Writer;
// @ts-ignore
const XmppParser = PortalCommon.XmppHelper.Parser;
const XmppErrors = PortalCommon.XmppHelper.Errors;
const RequestManager = PortalCommon.XmppHelper.RequestManager;

//XMPP eventing
const XMPP_MSG_ATTEMPT          = module.exports.XMPP_MSG_ATTEMPT            =  'attempt';
const XMPP_MSG_PROCEED          = module.exports.XMPP_MSG_PROCEED            =  'proceed';
const XMPP_MSG_REJECT          = module.exports.XMPP_MSG_REJECT            =  'reject';

// @ts-ignore
const LOG_ID = '[JINGLE INITIATION]';

class JingleMessageInitiation
{
    private _client: any;
    private _emitter: any;
    private _logger: any;
    private _config: any;
    private _writer: any;
    private _listener: any;
    private _requestManager: any;
    constructor (client, logger, config)
    {
        this._emitter = new EventEmitter();
        this._client = client;
        this._logger = logger;
        this._config = config;
        this._writer = new CommonMsg.Writer();
        this._listener = new CommonMsg.Listener(client);

        this._requestManager = RequestManager.init((this._config.xmpp.requestTimeout || 20) * 1000, this._logger);

        this._listener.on(CommonMsg.TYPE_NO_TYPE, (parsed) =>
        {
            this._onMessage(parsed, parsed.stanza);
        });
        this._listener.on(CommonMsg.TYPE_CHAT, (parsed) =>
        {
            this._onMessage(parsed, parsed.stanza);
            //this._logger.verbose('%s Received stanza of type = chat : %s', LOG_ID, parsed.toString());
        });
        this._listener.on(CommonMsg.TYPE_WEBRTC, (parsed) =>
        {
             this._logger.verbose('%s Received stanza of type = webrtc : %s', LOG_ID, parsed.toString());
        });
        this._listener.on(CommonMsg.TYPE_ERROR, (parsed) =>
        {
            this._logger.warn('%s Received stanza of type = error : %s', LOG_ID, parsed.toString());
        });
    }

    on(event, handler)
    {
        this._emitter.on(event, handler);
    }

    _onMessage(parsed, stanza)
    {
        this._logger.debug('%s _onMessage called %s', LOG_ID, stanza.toString());
        try
        {
            parsed.jidFrom = stanza.attr('from');
            parsed.jidTo = stanza.attr('to');

            if (this._onParseMessage(parsed, stanza))
            {
                return this._requestManager.onResponse(parsed.id, parsed);
            }

            this._logger.debug('%s Don\'t know what to do with this stanza', LOG_ID, stanza);

            throw new XmppErrors.IgnoredStanza('Don\'t know what to do with this stanza', stanza);
        }
        catch (err)
        {
            this._logger.error("%s Error occurred while parsing stanza %s. Err: ", LOG_ID, parsed.id, err.toString());
            return this._requestManager.onError(parsed.id, err);
        }
    }

    _onParseMessage(parsed, stanza)
    {
        let messageProceed = stanza.getChild('proceed');

        if (messageProceed)
        {
            this._logger.debug('%s _onParseMessage Proceed received', LOG_ID);

            parsed.name = 'proceed';
            parsed.id = messageProceed.attr('id');

            this._emitter.emit(XMPP_MSG_PROCEED, parsed);

            return true;
        }

        let messageReject = stanza.getChild('reject');
        if (messageReject)
        {
            this._logger.debug('%s _onParseMessage Reject received', LOG_ID);

            parsed.name = 'reject';
            parsed.id = messageReject.attr('id');

            this._emitter.emit(XMPP_MSG_REJECT, parsed);

            return true;
        }

        let messageAttempt = stanza.getChild('attempt');
        if (messageAttempt)
        {
            this._logger.debug('%s _onParseMessage Attempt received', LOG_ID);

            parsed.name = 'attempt';
            parsed.id = messageAttempt.attr('id');
            parsed.resources = messageAttempt.attr('resources');

            this._emitter.emit(XMPP_MSG_ATTEMPT, parsed);

            return true;
        }

        return false;
    }

    sendPropose(fromJidIm, toJidIm, callerInfo, sid)
    {

        let self = this;

        self._logger.debug("%s sendPropose to: '%s', id: '%s'", LOG_ID, toJidIm, sid);

        let newMsgId = XmppWriter.genId();

        let jingleMsgPropose = XmppWriter.createStanza(CommonMsg.STANZA_NAME,
            {
                from: fromJidIm,
                to: toJidIm,
                //id: (1000 + Math.floor(Math.random() * 9000)).toString()
                id: newMsgId
            })
            .c('propose', { xmlns: 'urn:xmpp:jingle-message:0', id: sid })
                .c('description', { xmlns: "urn:xmpp:jingle:apps:rtp:1", media: "audio" }).up()
                .c('mediapillar', { xmlns: "urn:xmpp:janus:1"})
                    .c('callernumber').t(callerInfo.callernumber).up()
                    .c('displayname').t(callerInfo.displayname).up()
            .up().up();

        var jingleMsgProposeP = self._requestManager.set(sid, jingleMsgPropose, self._config.environment.ringingTimeout * 1000);

        self._client.send(jingleMsgPropose);

        self._sendPresence(fromJidIm, toJidIm);

        return jingleMsgProposeP;
    }

    clearProposeTimeout(toJidIm, sid)
    {

        let self = this;

        self._logger.debug("%s clear Propose timeout to: '%s', id: '%s'", LOG_ID, toJidIm, sid);

        self._requestManager.clearTimeout(sid);
    }

    sendRetract(fromJidIm, toJidIm, sid)
    {

        let self = this;

        self._logger.debug("%s sendRetract to: '%s', id: '%s'", LOG_ID, toJidIm, sid);

        let newMsgId = XmppWriter.genId();

        let jingleMsgRetract = XmppWriter.createStanza(CommonMsg.STANZA_NAME,
            {
                from: fromJidIm,
                to: toJidIm,
                //id: (1000 + Math.floor(Math.random() * 9000)).toString()
                id: newMsgId
            })
            .c('retract', {
                xmlns: 'urn:xmpp:jingle-message:0', id: sid
            }).up().up();

        self._client.send(jingleMsgRetract);

    }

    _sendPresence(fromJidIm, toJidIm)
    {
        let self = this;
        self._logger.debug('%s _sendPresence to: \'%s\'', LOG_ID, toJidIm);

        let jingleDirectPresence = XmppWriter.createStanza(CommonPres.STANZA_NAME,
        {
            from: fromJidIm,
            to: toJidIm
        });

        self._client.send(jingleDirectPresence);
    }
}

module.exports.Helper = JingleMessageInitiation;
