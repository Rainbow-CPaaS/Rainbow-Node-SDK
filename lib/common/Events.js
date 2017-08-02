"use strict";

var Error = require("./Error");
const EventEmitter = require("events");

const LOG_ID = "EVENTS - ";

/**
 * @class
 * @name Events
 * @description
 *      This class lists every events that can be subscribed
 * 
 * @fires Events#rainbow_onmessageserverreceiptreceived
 * @fires Events#rainbow_onmessagereceiptreceived
 * @fires Events#rainbow_onmessagereceiptreadreceived
 * @fires Events#rainbow_onmessagereceived
 * @fires Events#rainbow_onerror
 * @fires Events#rainbow_oncontactpresencechanged
 * @fires Events#rainbow_onbubbleaffiliationchanged
 * @fires Events#rainbow_onbubbleownaffiliationchanged
 * @fires Events#rainbow_onbubbleinvitationreceived
 * 
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
                 * @type { Object }
                 * @param receipt
                 * @description 
                 *      Fired when the message has been received by the server
                 */
                that._evPublisher.emit("rainbow_onmessageserverreceiptreceived", receipt);
            }
            else {
                if (receipt.event === "received") {
                    /**
                     * @event Events#rainbow_onmessagereceiptreceived
                     * @type { Object }
                     * @param receipt
                     * @description 
                     *      Fired when the message has been received by the recipient
                     */
                    that._evPublisher.emit("rainbow_onmessagereceiptreceived", receipt);
                }
                else {
                    /**
                     * @event Events#rainbow_onmessagereceiptreadreceived
                     * @type { Object }
                     * @param receipt
                     * @description 
                     *      Fired when the message has been read by the recipient
                     */
                    that._evPublisher.emit("rainbow_onmessagereceiptreadreceived", receipt);
                }
            }
        });

        this._evReceiver.on("rainbow_onmessagereceived", function(json) {
            if (_filterCallback && _filterCallback(json.fromJid)) {
                that._logger.log("warn", `${LOG_ID} filtering event rainbow_onmessagereceived for jid: ${json.fromJid}` );
                return;
            }

            /**
             * @event Events#rainbow_onmessagereceived
             * @type { Object }
             * @param json
             * @description 
             *      Fired when a one-to-one message is received
             */
            that._evPublisher.emit("rainbow_onmessagereceived", json);
        });

        this._evReceiver.on("rainbow_onxmpperror", function(err) {
            var error = Error.XMPP;
            error.details = err;

            /**
             * @event Events#rainbow_onerror
             * @type { Object }
             * @param error
             * @description 
             *      Fired when something goes wrong (ie: bad 'configurations' parameter...)
             */
            that._evPublisher.emit("rainbow_onerror", error);
        });

        this._evReceiver.on("rainbow_onrosterpresencechanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactpresencechanged
             * @type { Object }
             * @param contact
             * @description 
             *      Fired when the presence of a contact changes
             */
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_affiliationdetailschanged", function(data) {
            /**
             * @event Events#rainbow_onbubbleaffiliationchanged
             * @type { Object }
             * @param data
             * @description 
             *      Fired when a user changes his affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_ownaffiliationdetailschanged", function(data) {
            /**
             * @event Events#rainbow_onbubbleownaffiliationchanged
             * @type { Object }
             * @param data
             * @description 
             *      Fired when a user changes the user connected affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleownaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_invitationdetailsreceived", function(data) {
            /**
             * @event Events#rainbow_onbubbleinvitationreceived
             * @type { Object }
             * @param data
             * @description 
             *      Fired when an invitation to join a bubble is received
             */
            that._evPublisher.emit("rainbow_onbubbleinvitationreceived", data);
        });
    }

    get iee() {
        return this._evReceiver;
    }

    get eee() {
        return this._evPublisher;
    }

    publish(event, data) {

        let info = data || Error.OK;

        this._logger.log("info", LOG_ID + "(publish) event rainbow_on" + event);
        this._evPublisher.emit("rainbow_on" + event, info);
    }

}
module.exports = Events;