"use strict";

var Error = require("./Error");
const EventEmitter = require("events");

const LOG_ID = "EVENTS - ";

/**
 * @class
 * @name Events
 * @description
 *      This module fires every events that come from Rainbow.<br/>
 *      To receive them, you need to subscribe individually to each of the following events<br/>
 * @fires Events#rainbow_onmessageserverreceiptreceived
 * @fires Events#rainbow_onmessagereceiptreceived
 * @fires Events#rainbow_onmessagereceiptreadreceived
 * @fires Events#rainbow_onmessagereceived
 * @fires Events#rainbow_onerror
 * @fires Events#rainbow_oncontactpresencechanged
 * @fires Events#rainbow_onbubbleaffiliationchanged
 * @fires Events#rainbow_onbubbleownaffiliationchanged
 * @fires Events#rainbow_onbubbleinvitationreceived
 */
class Events {

    constructor( _logger, _filterCallback) {
        var that = this;

        this._logger = _logger;
        this._filterCallback = _filterCallback;

        this._evReceiver = new EventEmitter();

        this._evPublisher = new EventEmitter();

        this._evReceiver.on("rainbow_onreceipt", function(receipt) {
            if (_filterCallback && _filterCallback(receipt.fromJid)) {
                that._logger.log("warn", `${LOG_ID} filtering event rainbow_onreceipt for jid: ${receipt.fromJid}` );
                return;
            }
            if (receipt.entity === "server") {
                /**
                 * @event Events#rainbow_onmessageserverreceiptreceived
                 * @param {Object} receipt The receipt received by the server
                 * @description 
                 *      Fired when the message has been received by the server
                 */
                that._evPublisher.emit("rainbow_onmessageserverreceiptreceived", receipt);
            }
            else {
                if (receipt.event === "received") {
                    /**
                     * @event Events#rainbow_onmessagereceiptreceived
                     * @param {Object} receipt The 'received' receipt
                     * @description 
                     *      Fired when the message has been received by the recipient
                     */
                    that._evPublisher.emit("rainbow_onmessagereceiptreceived", receipt);
                }
                else {
                    /**
                     * @event Events#rainbow_onmessagereceiptreadreceived
                     * @param {Object} receipt the 'read' receipt 
                     * @description 
                     *      Fired when the message has been read by the recipient
                     */
                    that._evPublisher.emit("rainbow_onmessagereceiptreadreceived", receipt);
                }
            }
        });

        this._evReceiver.on("rainbow_onmessagereceived", function(message) {
            if (_filterCallback && _filterCallback(message.fromJid)) {
                that._logger.log("warn", `${LOG_ID} filtering event rainbow_onmessagereceived for jid: ${message.fromJid}` );
                return;
            }

            /**
             * @event Events#rainbow_onmessagereceived
             * @param {Object} message The message received
             * @description 
             *      Fired when a one-to-one message is received
             */
            that._evPublisher.emit("rainbow_onmessagereceived", message);
        });

        this._evReceiver.on("rainbow_onxmpperror", function(err) {
            var error = Error.XMPP;
            error.details = err;

            /**
             * @event Events#rainbow_onerror
             * @param {Object} error The error received
             * @description 
             *      Fired when something goes wrong (ie: bad 'configurations' parameter...)
             */
            that._evPublisher.emit("rainbow_onerror", error);
        });

        this._evReceiver.on("rainbow_onrosterpresencechanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactpresencechanged
             * @param { Object } contact The contact
             * @description 
             *      Fired when the presence of a contact changes
             */
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_affiliationdetailschanged", function(data) {
            /**
             * @event Events#rainbow_onbubbleaffiliationchanged
             * @param { Object } data The affiliation
             * @description 
             *      Fired when a user changes his affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_ownaffiliationdetailschanged", function(data) {
            /**
             * @event Events#rainbow_onbubbleownaffiliationchanged
             * @param { Object } data The affiliation
             * @description 
             *      Fired when a user changes the user connected affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleownaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_invitationdetailsreceived", function(invitation) {
            /**
             * @event Events#rainbow_onbubbleinvitationreceived
             * @param { Object } invitation The invitation received
             * @description 
             *      Fired when an invitation to join a bubble is received
             */
            that._evPublisher.emit("rainbow_onbubbleinvitationreceived", invitation);
        });
    }

    get iee() {
        return this._evReceiver;
    }

    get eee() {
        return this._evPublisher;
    }

    /**
     * @method on
     * @memberof Events
     * @param {string} event The event name to subscribe
     * @param {function} callback The function called when the even is fired
     * @return {Object} The events instance to be able to chain subscriptions
     * @description
     *      Subscribe to an event
     * @memberof Events
     */
    on(event, callback) {
        return this._evPublisher.on(event, callback);
    }

    publish(event, data) {

        let info = data || Error.OK;

        this._logger.log("info", LOG_ID + "(publish) event rainbow_on" + event);
        this._evPublisher.emit("rainbow_on" + event, info);
    }

}
module.exports = Events;