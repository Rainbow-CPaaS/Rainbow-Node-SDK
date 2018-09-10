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
 * @fires Events#rainbow_onchatstate
 * @fires Events#rainbow_oncontactinformationchanged
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
 * @fires Events#rainbow_oncallupdated
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
                that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onmessageserverreceiptreceived"));
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
                    that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onmessagereceiptreceived"));
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
                    that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onmessagereceiptreadreceived"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onmessagereceived"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_oncontactpresencechanged"));
            that._evPublisher.emit("rainbow_oncontactpresencechanged", contact);
        });

        this._evReceiver.on("rainbow_onconversationremoved", function(conversation) {

            /**
             * @event Events#rainbow_onconversationremoved
             * @param { Object } conversation The conversation object
             * @param { String } conversation.conversationId Conversation identifier
             * @description 
             *      This event is fired when a conversation has been removed
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onconversationremoved"));
            that._evPublisher.emit("rainbow_onconversationremoved", conversation);
        });

        this._evReceiver.on("rainbow_onconversationupdated", function(conversation) {

            /**
             * @event Events#rainbow_onconversationchanged
             * @param { Contact } conversation The conversation
             * @description 
             *      This event is fired when a conversation has changed
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onconversationupdated"));
            that._evPublisher.emit("rainbow_onconversationchanged", conversation);
        });

        this._evReceiver.on("rainbow_onchatstate", function(chatstate) {

            /**
             * @event Events#rainbow_onchatstate
             * @param { Object } chatstate The chatstate
             * @description 
             *      This event is fired when a chatstate event occurs
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onchatstate"));
            that._evPublisher.emit("rainbow_onchatstate", chatstate);
        });

        this._evReceiver.on("rainbow_oncontactinformationchanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactinformationchanged
             * @param { Contact } contact The contact
             * @description 
             *      This event is fired when a conversation has been removed
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_oncontactinformationchanged"));
            that._evPublisher.emit("rainbow_oncontactinformationchanged", contact);
        });

        this._evReceiver.on("rainbow_onuserinvitereceived", function(invitation) {
            /**
             * @event Events#rainbow_onuserinvitereceived
             * @private
             * @param { Invitation } invitation The invitation received
             * @description
             *      Fired when an user invitation is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onuserinvitereceived"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onuserinviteaccepted"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onuserinvitecanceled"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubbleaffiliationchanged"));
            that._evPublisher.emit("rainbow_onbubbleaffiliationchanged", bubble);
        });

        this._evReceiver.on("rainbow_ownaffiliationdetailschanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleownaffiliationchanged
             * @param { Bubble } bubble The bubble updated
             * @description 
             *      Fired when a user changes the user connected affiliation with a bubble
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubbleownaffiliationchanged"));
            that._evPublisher.emit("rainbow_onbubbleownaffiliationchanged", bubble);
        });

        this._evReceiver.on("rainbow_invitationdetailsreceived", function(bubble) {

            bubble.users.forEach((user) => {
                if (user && user.jid_im === that._core._rest.loggedInUser.jid_im && user.status === "accepted") {
                    // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                    that._core.bubbles._sendInitialBubblePresence(bubble);
                }
            });

            /**
             * @event Events#rainbow_onbubbleinvitationreceived
             * @public
             * @param { Bubble } bubble The invitation bubble
             * @description 
             *      Fired when an invitation to join a bubble is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubbleinvitationreceived"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubblecustomdatachanged"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubbletopicchanged"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onbubblenamechanged"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_ongroupcreated"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_ongroupdeleted"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_ongroupupdated"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onuseraddedingroup"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onuserremovedfromgroup"));
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
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onchannelmessagereceived"));
            that._evPublisher.emit("rainbow_onchannelmessagereceived", message);
        });

        this._evReceiver.on("rainbow_onprofilefeatureupdated", function () {
            /**
             * @event Events#rainbow_onprofilefeatureupdated
             * @public
             * @param
             * @description
             *      Fired when a profile feature updated event is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onprofilefeatureupdated"));
            that._evPublisher.emit("rainbow_onprofilefeatureupdated" );
        });

        this._evReceiver.on("rainbow_oncallupdated", function (data) {
            /**
             * @event Events#rainbow_oncallupdated
             * @public
             * @param { data }
             * @description
             *      Fired when a call event is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_oncallupdated"));
            that._evPublisher.emit("rainbow_oncallupdated", data);
        });

        this._evReceiver.on("rainbow_onvoicemessageupdated", function (data) {
            /**
             * @event Events#rainbow_onvoicemessageupdated
             * @public
             * @param { data }
             * @description
             *      Fired when a voice message updated event is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_onvoicemessageupdated"));
            that._evPublisher.emit("rainbow_onvoicemessageupdated", data);
        });

        this._evReceiver.on("rainbow_oncallforwarded", function (data) {
            /**
             * @event Events#rainbow_oncallforwarded
             * @public
             * @param { data }
             * @description
             *      Fired when a call forwarded event is received
             */
            that._logger.log("debug", LOG_ID + "publish event " + that._logger.colors.events("rainbow_oncallforwarded"));
            that._evPublisher.emit("rainbow_oncallforwarded", data);
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

        this._logger.log("info", LOG_ID + "(publish) event " + this._logger.colors.events("rainbow_on" + event) + " : ", info);
        this._evPublisher.emit("rainbow_on" + event, info);
    }

    setCore(_core) {
        this._core = _core;
    }

}
module.exports = Events;