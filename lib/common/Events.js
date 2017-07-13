"use strict";

var Error = require("./Error");
const EventEmitter = require("events");

const LOG_ID = "EVENTS - ";

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
                that._evPublisher.emit("rainbow_onmessageserverreceiptreceived", receipt);
            }
            else {
                if (receipt.event === "received") {
                    that._evPublisher.emit("rainbow_onmessagereceiptreceived", receipt);
                }
                else {
                    that._evPublisher.emit("rainbow_onmessagereceiptreadreceived", receipt);
                }
            }
        });

        this._evReceiver.on("rainbow_onmessagereceived", function(json) {
            if (_filterCallback && _filterCallback(json.fromJid)) {
                that._logger.log("warn", `${LOG_ID} filtering event rainbow_onmessagereceived for jid: ${json.fromJid}` );
                return;
            }
            that._evPublisher.emit("rainbow_onmessagereceived", json);
        });

        this._evReceiver.on("rainbow_onxmpperror", function(err) {
            var error = Error.XMPP;
            error.details = err;
            that._evPublisher.emit("rainbow_onerror", error);
        });

        this._evReceiver.on("rainbow_onrosterpresencechanged", function(contact) {
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_affiliationdetailschanged", function(data) {
            that._evPublisher.emit("rainbow_onbubbleaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_ownaffiliationdetailschanged", function(data) {
            that._evPublisher.emit("rainbow_onbubbleownaffiliationchanged", data);
        });

        this._evReceiver.on("rainbow_invitationdetailsreceived", function(data) {
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