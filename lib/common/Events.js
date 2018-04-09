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
 * @fires Events#rainbow_oncontactpresencechanged
 * @fires Events#rainbow_onconversationremoved
 * @fires Events#rainbow_onconversationchanged
 * @fires Events#rainbow_onconversationschanged
 * @fires Events#rainbow_onconversationsmissedcounterchanged
 * @fires Events#rainbow_onuserinvitereceived
 * @fires Events#rainbow_onuserinviteaccepted
 * @fires Events#rainbow_onuserinvitecanceled
 * @fires Events#rainbow_onbubbleaffiliationchanged
 * @fires Events#rainbow_onbubbleownaffiliationchanged
 * @fires Events#rainbow_onbubbleinvitationreceived
 * @fires Events#rainbow_onbubblecustomDatachanged
 * @fires Events#rainbow_onbubbletopicchanged
 * @fires Events#rainbow_onbubblenamechanged
 * @fires Events#rainbow_ongroupcreated
 * @fires Events#rainbow_ongroupdeleted
 * @fires Events#rainbow_ongroupupdated
 * @fires Events#rainbow_onuseraddedingroup
 * @fires Events#rainbow_onuserremovedfromgroup
 * @fires Events#rainbow_onstarted
 * @fires Events#rainbow_onstopped
 * @fires Events#rainbow_onready
 * @fires Events#rainbow_onerror
 * @fires Events#rainbow_onconnected
 * @fires Events#rainbow_onconnectionerror
 * @fires Events#rainbow_ondisconnected
 * @fires Events#rainbow_onreconnecting
 * @fires Events#rainbow_onfailed
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
                 * @public
                 * @event Events#rainbow_onmessageserverreceiptreceived
                 * @param {Object} receipt The receipt received by the server
                 * @param {string} receipt.event The type of receipt. Can be `read` or `received`. Should be `received` in that case
                 * @param {string} receipt.entity The entity who sent the receipt. Can be `server` or `client`. Should be `server` in that case
                 * @param {string} receipt.type The type of the message. Can be `chat` or `groupchat`.
                 * @param {string} receipt.id The id of the message sent (linked to that receipt)
                 * @memberof Events
                 * @description 
                 *      Fired when the message has been received by the server
                 */
                that._evPublisher.emit("rainbow_onmessageserverreceiptreceived", receipt);
            }
            else {
                if (receipt.event === "received") {
                    /**
                     * @public
                     * @event Events#rainbow_onmessagereceiptreceived
                     * @param {Object} receipt The receipt received by the server
                     * @param {string} receipt.event The type of receipt. Can be `read` or `received`. Should be `received` in that case
                     * @param {string} receipt.entity The entity who sent the receipt. Can be `server` or `client`. Should be `client` in that case
                     * @param {string} receipt.type The type of the message. Can be `chat` or `groupchat`
                     * @param {string} receipt.id The id of the message sent (linked to that receipt)
                     * @param {string} receipt.fromJid The Bare JID of the recipient who sent this receipt,
                     * @param {string} receipt.resource The resource JID of the recipient who sent this receipt 
                     * @description 
                     *      Fired when the message has been received by the recipient
                     */
                    that._evPublisher.emit("rainbow_onmessagereceiptreceived", receipt);
                }
                else {
                    /**
                     * @public
                     * @event Events#rainbow_onmessagereceiptreadreceived
                     * @param {Object} receipt The receipt received by the server
                     * @param {string} receipt.event The type of receipt. Can be `read` or `received`. Should be `read` in that case
                     * @param {string} receipt.entity The entity who sent the receipt. Can be `server` or `client`. Should be `client` in that case
                     * @param {string} receipt.type The type of the message. Can be `chat` or `groupchat`
                     * @param {string} receipt.id The id of the message sent (linked to that receipt)
                     * @param {string} receipt.fromJid The Bare JID of the recipient who sent this receipt,
                     * @param {string} receipt.resource The resource JID of the recipient who sent this receipt 
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
             * @public
             * @param {Message} message The message received
             * @description 
             *      Fired when a chat message is received (in a one-to-one conversation or in a Bubble conversation)
             */
            that._evPublisher.emit("rainbow_onmessagereceived", message);
        });

        this._evReceiver.on("rainbow_onrosterpresencechanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactpresencechanged
             * @public
             * @param { Contact } contact The contact
             * @description 
             *      Fired when the presence of a contact changes
             */
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_onrosterpresencechanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactpresencechanged
             * @param { Conversation } contact The contact
             * @description 
             *      This event is fired when a conversation has been removed
             */
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_onuserinvitereceived", function(invitation) {
            /**
             * @event Events#rainbow_onuserinvitereceived
             * @private
             * @param { Invitation } invitation The invitation received
             * @description
             *      Fired when an user invitation is received
             */
            that._evPublisher.emit("rainbow_onuserinvitereceived", invitation);
        });

        this._evReceiver.on("rainbow_onuserinviteaccepted", function(invitation) {
            /**
             * @event Events#rainbow_onuserinviteaccepted
             * @private
             * @param { Invitation } invitation The invitation accepted
             * @description
             *      Fired when an user invitation is accepted
             */
            that._evPublisher.emit("rainbow_onuserinviteaccepted", invitation);
        });

        this._evReceiver.on("rainbow_onuserinvitecanceled", function(invitation) {
            /**
             * @event Events#rainbow_onuserinvitecanceled
             * @private
             * @param { Invitation } invitation The invitation canceled
             * @description
             *      Fired when an user invitation is canceled
             */
            that._evPublisher.emit("rainbow_onuserinvitecanceled", invitation);
        });

        this._evReceiver.on("rainbow_affiliationdetailschanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleaffiliationchanged
             * @public
             * @param { Bubble } bubble The bubble updated
             * @description 
             *      Fired when a user changes his affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleaffiliationchanged", bubble);
        });

        this._evReceiver.on("rainbow_ownaffiliationdetailschanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleownaffiliationchanged
             * @param { Bubble } bubble The bubble updated
             * @description 
             *      Fired when a user changes the user connected affiliation with a bubble
             */
            that._evPublisher.emit("rainbow_onbubbleownaffiliationchanged", bubble);
        });

        this._evReceiver.on("rainbow_invitationdetailsreceived", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleinvitationreceived
             * @public
             * @param { Bubble } bubble The invitation bubble
             * @description 
             *      Fired when an invitation to join a bubble is received
             */
            that._evPublisher.emit("rainbow_onbubbleinvitationreceived", bubble);
        });

        this._evReceiver.on("rainbow_bubblecustomDatachanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubblecustomdatachanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new custom data set
             * @description 
             *      Fired when the custom data of a bubble has changed
             */
            that._evPublisher.emit("rainbow_onbubblecustomdatachanged", bubble);
        });

        this._evReceiver.on("rainbow_bubbletopicchanged", function(bubble) {
            /**
             * @event Events#rainbow_bubbletopicchanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new topic set
             * @description 
             *      Fired when the topic of a bubble has changed
             */
            that._evPublisher.emit("rainbow_onbubbletopicchanged", bubble);
        });

        this._evReceiver.on("rainbow_bubblenamechanged", function(bubble) {
            /**
             * @event Events#rainbow_bubblenamechanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new name set
             * @description 
             *      Fired when the name of a bubble has changed
             */
            that._evPublisher.emit("rainbow_onbubblenamechanged", bubble);
        });

        this._evReceiver.on("rainbow_ongroupcreated", function(group) {
            /**
             * @event Events#rainbow_ongroupcreated
             * @public
             * @param { Group } group The created group
             * @description
             *      Fired when a group is created
             */
            that._evPublisher.emit("rainbow_ongroupcreated", group);
        });

        this._evReceiver.on("rainbow_ongroupdeleted", function(group) {
            /**
             * @event Events#rainbow_ongroupdeleted
             * @public
             * @param { Group } group The deleted group
             * @description
             *      Fired when a group is deleted
             */
            that._evPublisher.emit("rainbow_ongroupdeleted", group);
        });

        this._evReceiver.on("rainbow_ongroupupdated", function(group) {
            /**
             * @event Events#rainbow_ongroupupdated
             * @public
             * @param { Group } group The updated group
             * @description
             *      Fired when a group is updated
             */
            that._evPublisher.emit("rainbow_ongroupupdated", group);
        });

        this._evReceiver.on("rainbow_onuseraddedingroup", function(group, contact) {
            /**
             * @event Events#rainbow_onuseraddedingroup
             * @public
             * @param { Group } group The group where the user is added
             * @param { Contact} contact The user added
             * @description
             *      Fired when a user is added in a group
             */
            that._evPublisher.emit("rainbow_onuseraddedingroup", group, contact);
        });

        this._evReceiver.on("rainbow_onuserremovedfromgroup", function(group, contact) {
            /**
             * @event Events#rainbow_onuserremovedfromgroup
             * @public
             * @param { Group } group The group where the user is removed
             * @param { Contact} contact The user removed
             * @description
             *      Fired when a user is removed from a group
             */
            that._evPublisher.emit("rainbow_onuserremovedfromgroup", group, contact);
        });

        this._evReceiver.on("rainbow_channelmessagereceived", function(message) {
            /**
             * @event Events#rainbow_onchannelmessagereceived
             * @public
             * @param { ChannelMessage } message The message received
             * @description
             *      Fired when a message is received from a channel
             */
            that._evPublisher.emit("rainbow_onchannelmessagereceived", message);
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
     * @public
     * @memberof Events
     * @instance
     * @param {string} event The event name to subscribe
     * @param {function} callback The function called when the even is fired
     * @return {Object} The events instance to be able to chain subscriptions
     * @description
     *      Subscribe to an event
     */
    on(event, callback) {
        return this._evPublisher.on(event, callback);
    }

    /**
     * @method once
     * @public
     * @memberof Events
     * @instance
     * @param {string} event The event name to subscribe
     * @param {function} callback The function called when the even is fired
     * @return {Object} The events instance to be able to chain subscriptions
     * @description
     *      Subscribe to an event only one time (fired only the first time)
     */
    once(event, callback) {
        return this._evPublisher.once(event, callback);
    }

    publish(event, data) {

        let info = data || Error.OK;

        /**
         * @event Events#rainbow_onstarted
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK has successfully started (not yet signed in)
         */

        /**
         * @event Events#rainbow_onstopped
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK has been successfully stopped (all services have been stopped)
         */

        /**
         * @event Events#rainbow_onconnected
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the connection is successfull with Rainbow (signin complete)
         */

        /**
         * @event Events#rainbow_onconnectionerror
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the connection can't be done with Rainbow (ie. issue on sign-in)
         */

        /**
         * @event Events#rainbow_ondisconnected
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK lost the connection with Rainbow
         */

        /**
         * @event Events#rainbow_onreconnecting
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK tries to reconnect
         */

        /**
         * @event Events#rainbow_onfailed
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK didn't succeed to reconnect and stop trying
         */

        /**
         * @event Events#rainbow_onready
         * @public
         * @param { Object } status The event status
         * @description 
         *      Fired when the SDK is connected to Rainbow and ready to be used
         */

         /**
          * @event Events#rainbow_onerror
          * @public
          * @param {Object} error The error received
          * @description 
          *      Fired when something goes wrong (ie: bad 'configurations' parameter...). Used by application to stop, start the sdk again.
          */

        this._logger.log("info", LOG_ID + "(publish) event rainbow_on" + event);
        this._evPublisher.emit("rainbow_on" + event, info);
    }

}
module.exports = Events;