"use strict";

var Error = require("../common/Error");

const PubSub = require("pubsub-js");
const ConversationEventHandler = require("../connection/XMPPServiceHandler/conversationEventHandler");

const LOG_ID = "CONVERSATIONS - ";

/**
 * @class
 * @name Conversations
 * @description
 *       This module manages conversations. A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information.<br>
 *       Using this module, you can get access to your network contacts or search for Rainbow contacts.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get the network contacts (roster) <br>
 *      - Get and search contacts by Id, JID or loginEmail <br>
 */
class Conversations {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest) {
        let that = this;
        this.conversationHandlerToken = [];
        this
            ._logger
            .log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve, reject) => {
            try {
                this._xmpp = _xmpp;
                this._rest = _rest;

                that.conversationEventHandler = new ConversationEventHandler(that._xmpp);
                that.conversationHandlerToken = [
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_MANAGEMENT, that.conversationEventHandler.onChatMessageReceived),
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_ERROR, that.conversationEventHandler.onChatMessageReceived),
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_HEADLINE, that.conversationEventHandler.onChatMessageReceived),
                    PubSub.subscribe(that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onChatMessageReceived)
                ];

                this
                    ._logger
                    .log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            } catch (err) {
                this
                    ._logger
                    .log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;
        this
            ._logger
            .log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that.conversationEventHandler;
                that.conversationEventHandler = null;
                that.conversationHandlerToken.forEach( (token) => PubSub.unsubscribe(token) );
                that.conversationHandlerToken = [];

                that
                    ._logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that
                    ._logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }
}

module.exports = Conversations;