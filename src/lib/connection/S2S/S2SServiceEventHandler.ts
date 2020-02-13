"use strict";

import {InvitationEventHandler} from "../XMPPServiceHandler/invitationEventHandler";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

import {logEntryExit} from "../../common/Utils";

const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "S2S/HNDL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class S2SServiceEventHandler {
    private logger: any;
    private eventEmitter: any;
    private rest: any

    constructor(_rest, _im, _application, _eventEmitter, _logger) {
        this.logger = _logger;
        this.eventEmitter = _eventEmitter;
        this.rest = _rest;

    }

    handleS2SEvent(event) {
        let that = this;

        that.logger.log("internal", LOG_ID + "*************************************************");
        that.logger.log("internal", LOG_ID + "received an event: ");
        that.logger.log("internal", LOG_ID + "METHOD : ", event.method);
        that.logger.log("internal", LOG_ID + "BASELURL : ", event.baseUrl);
        that.logger.log("internal", LOG_ID + "ORIGINALURL : ", event.originalUrl);
        that.logger.log("internal", LOG_ID + "BODY : ", that.logger.colors.events(event.body));
        that.logger.log("internal", LOG_ID + "*************************************************");
        let body = event.body;

        if (body && body.connection && body.connection.state === "ready") {
            that.eventEmitter.emit("evt_internal_ons2sready", body);
            //await that.sendS2SPresence({});
        }
    }

}

export {S2SServiceEventHandler};
module.exports.S2SServiceEventHandler = S2SServiceEventHandler;
