"use strict";

const LOG_ID = 'BUBBLES - ';

class Bubbles {

    constructor(_eventEmitter, _logger) {
        var that = this;

        this._xmpp = null;
        this._rest = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest) {
        this._logger.log("debug", LOG_ID + "(start) _entering_");
        this._xmpp = _xmpp;
        this._rest = _rest;
        //this.eventEmitter.on('rainbow_onrosterpresence', onRosterPresenceChanged);
        this._logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    /**
     * @public
     * @method createBubble
     * @param {string} strName  The name of the bubble to create
     * @param {string} strDescription  The description of the bubble to create
     * @param {string} strReason    The reason invitation
     * @param {Contact} contact     The contact to invite
     * @return {Bubble} A bubble
     * @description
     *  Create a new bubble and invite a user in
     */
    createBubble(strName, strDescription, strReason, contact) {

        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(createBubble) _entering_");

            that._rest.createBubble(strName, strDescription).then(function(bubble) {
                that._logger.log("debug", LOG_ID + "(createBubble) successfully");
                that._xmpp.sendInitialBubblePresence(bubble.jid);
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                resolve(bubble);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(createBubble) error");
                that._logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(err);
            });
            
        });
    }

    stop() {
        this._xmpp = null;
        this._rest = null;
    }

}

module.exports = Bubbles;

