"use strict";

var Error = require('./Error');
const EventEmitter = require('events');

const LOG_ID = 'EVENTS - ';

class Events {

    constructor( _logger) {
        var that = this;

        this._logger = _logger;

        this._evReceiver = new EventEmitter();

        this._evPublisher = new EventEmitter();

        var hasReceivedConnectionOK = false;
        var hasReceivedReady = false;

        this._evReceiver.on('rainbow_onreceipt', function(receipt) {
            if(receipt.entity === 'server') {
                that._evPublisher.emit('rainbow_onmessageserverreceiptreceived', receipt);
            }
            else {
                if(receipt.event === "received") {
                    that._evPublisher.emit('rainbow_onmessagereceiptreceived', receipt);
                }
                else {
                    that._evPublisher.emit('rainbow_onmessagereceiptreadreceived', receipt);
                }
            }
        });

        this._evReceiver.on('rainbow_onmessagereceived', function(json) {
            that._evPublisher.emit('rainbow_onmessagereceived', json);
        });

        this._evReceiver.on('rainbow_onxmpperror', function(err) {
            var error = Error.XMPP;
            error.details = err;
            that._evPublisher.emit('rainbow_onerror', error);
        });

        this._evReceiver.on('rainbow_onrosterpresencechanged', function(contact) {
            that._evPublisher.emit('rainbow_oncontactpresencechanged', contact);
        });

        
        this._evReceiver.on('rainbow_connectionok', function() {
            var success = Error.OK;
            hasReceivedConnectionOK = true;

            that._evPublisher.emit('rainbow_onconnectionok', success);

            if(hasReceivedReady) {
                that._evPublisher.emit('rainbow_onready', success);
            }
        });

        this._evReceiver.on('rainbow_ready', function() {
            var success = Error.OK;
            hasReceivedReady = true;

            if(hasReceivedConnectionOK) {
                that._evPublisher.emit('rainbow_onready', success);
            }
        });

        this._evReceiver.on('rainbow_oninvitationchanged', function(data) {
            that._evPublisher.emit('rainbow_oninvitationstatuschanged', data);
        });
    }

    get iee() {
        return this._evReceiver;
    }

    get eee() {
        return this._evPublisher;
    }

}
module.exports = Events;