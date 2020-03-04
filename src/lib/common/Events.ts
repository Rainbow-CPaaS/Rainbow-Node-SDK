"use strict";
import construct = Reflect.construct;

export {};

import {ErrorManager} from "./ErrorManager";
import {EventEmitter} from "events";
import {Core} from "../Core";
import {Logger} from "./Logger";

const LOG_ID = "EVENTS - ";
let EventEmitterClass = EventEmitter;

 // dev-code //
 // @ class  Emitter EventEmitter class extended to log the event names and parameters.
class Emitter extends EventEmitter {
    public _logger: Logger;

    constructor( _logger : Logger) {
        super();
        let that = this;

        this._logger = _logger;
    }

    emit(type, ...args): boolean {
        let that = this;
        try {
        that._logger.log("internal", LOG_ID + "EventEmitter(emit) event ", that._logger.colors.eventsEmitter(type));
        } catch (e) {
            that._logger.log("error", LOG_ID + "EventEmitter(emit) Catch Error !!! error : ", e);
        }

        return super.emit(type, ...args)
    }

    on(event: string | symbol, listener: (...args: any[]) => void): this {
        let params = [];
        let that = this;
        let listenerWithLog = (...args: any[]) => {
            try {
                if (args.length === 0) {
                    that._logger.log("internal", LOG_ID + "EventEmitter(on) event ", that._logger.colors.eventsEmitter(event));
                }
                let iter = 0;
                [...params] = args;
                params.forEach((dataIter) => {
                    //console.log("EVENT dataIter : ", dataIter);
                    //that._logger.log("internal", LOG_ID + "EventEmitter(on) param ", iter++, " for event ", that._logger.colors.events(eventName), " data : ", dataIter);
                    let data = that._logger.argumentsToString(["", dataIter]);
                    //console.log("EVENT data : ", data);
                    that._logger.log("internal", LOG_ID + "EventEmitter(on) param ", iter++, " for event ", that._logger.colors.eventsEmitter(event), " data : ", that._logger.colors.data(data));

                });
            } catch (e) {
                that._logger.log("error", LOG_ID + "EventEmitter(on) Catch Error !!! error : ", e);
            }

            return listener(...args);
        };
        super.on(event, listenerWithLog);
        return this;
    }
}
// end-dev-code //

// dev-code //

/*

// The comment is removed at grunt build so the default EventEmitter is used when delivered.

// end-dev-code //

class Emitter extends EventEmitterClass{
    constructor(props) {
        super();
    }
}
// */


/**
 * @class
 * @name Events
 * @description
 *      This module fires every events that come from Rainbow.<br/>
 *      To receive them, you need to subscribe individually to each of the following events<br/>
 * @fires Events#rainbow_onrainbowversionwarning
 * @fires Events#rainbow_onmessageserverreceiptreceived
 * @fires Events#rainbow_onmessagereceiptreceived
 * @fires Events#rainbow_onmessagereceiptreadreceived
 * @fires Events#rainbow_onmessagereceived
 * @fires Events#rainbow_onsendmessagefailed
 * @fires Events#rainbow_oncontactpresencechanged
 * @fires Events#rainbow_onpresencechanged
 * @fires Events#rainbow_onconversationremoved
 * @fires Events#rainbow_onconversationchanged
 * @fires Events#rainbow_onallmessagedremovedfromconversationreceived
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
 * @fires Events#rainbow_onbubbleprivilegechanged
 * @fires Events#rainbow_onbubbleavatarchanged
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
 * @fires Events#rainbow_onconferenced
 * @fires Events#rainbow_ontelephonystatuschanged
 * @fires Events#rainbow_onnomadicstatusevent
 * @fires Events#rainbow_onvoicemessageupdated
 * @fires Events#rainbow_oncallforwarded
 * @fires Events#rainbow_onchannelmessagereceived
 * @fires Events#rainbow_onchannelmessagedeletedreceived
 * @fires Events#rainbow_onprofilefeatureupdated
 * @fires Events#rainbow_onfilecreated
 * @fires Events#rainbow_onfileupdated
 * @fires Events#rainbow_onfiledeleted
 * @fires Events#rainbow_onthumbnailcreated
 * @fires Events#rainbow_onchannelupdated
 * @fires Events#rainbow_onchannelusersubscription
 * @fires Events#rainbow_onmediapropose
 * @fires Events#rainbow_oncalllogupdated
 * @fires Events#rainbow_oncalllogackupdated
 * @fires Events#rainbow_onfavoritecreated
 * @fires Events#rainbow_onfavoritedeleted
*/
class Events {
	public _logger: Logger;
	public _filterCallback: Function;
	public _evReceiver: EventEmitter;
	public _evPublisher: EventEmitter;
	public _core: Core;

    constructor( _logger : Logger, _filterCallback : Function) {
        let that = this;

        this._logger = _logger;
        this._filterCallback = _filterCallback;

        this._evReceiver = new Emitter(this._logger);

        this._evPublisher = new EventEmitter();

        /*
        this._evReceiver.on('evt_internal_on*', function(...args: any[]) {
            let event;
            let params;
            let that = this;
            [event, ...params] = args;

            let eventName = this.event;

            that._logger.log("internal", LOG_ID + "(evt_internal_on*) receive event " + that._logger.colors.events(eventName.toString()));
            //console.log(this.event, value1, value2);
        });
         */

        this._evReceiver.on("evt_internal_onreceipt", function(receipt) {
            if (_filterCallback && _filterCallback(receipt.fromJid)) {
                that._logger.log("warn", `${LOG_ID} filtering event evt_internal_onreceipt for jid: ${receipt.fromJid}` );
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
                that.publishEvent("messageserverreceiptreceived", receipt);
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
                    that.publishEvent("messagereceiptreceived", receipt);
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
                    that.publishEvent("messagereceiptreadreceived", receipt);
                }
            }
        });

        this._evReceiver.on("evt_internal_onmessagereceived", function(message) {
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
            that.publishEvent("messagereceived", message);
        });

        this._evReceiver.on("evt_internal_onsendmessagefailed", function(message) {
            /**
             * @event Events#rainbow_onsendmessagefailed
             * @public
             * @param { Message } message The message which failed to be sent.
             * @description
             *      Fired when a chat message with no-store attribut sent has failed.
             */
            that.publishEvent("sendmessagefailed", message);
        });
  this._evReceiver.on("evt_internal_onrainbowversionwarning", function(data) {
            /**
             * @event Events#rainbow_onrainbowversionwarning
             * @public
             * @param { Object } data The warning object about the curent SDK version which is not the latest one provided on npmjs.com.
             * @param { string } data.label The label warning.
             * @param { string } data.currentPackage The curent SDK version used.
             * @param { string } data.latestPublishedPackage The latest one provided on npmjs.com.
             * @description
             *      Fired when a chat message with no-store attribut sent has failed.
             */
            that.publishEvent("rainbowversionwarning", data);
        });

        this._evReceiver.on("evt_internal_onrosterpresencechanged", function(contact) {

            /**
             * @event Events#rainbow_oncontactpresencechanged
             * @public
             * @param { Contact } contact The contact
             * @description
             *      Fired when the presence of a contact changes
             */
            that.publishEvent("contactpresencechanged", contact);
        });

        this._evReceiver.on("evt_internal_presencechanged", function(presence) {

            /**
             * @event Events#rainbow_onpresencechanged
             * @public
             * @param {Object} presence The presence object updated (jid, status, message, stamp)
             * @description
             *      This event is fired when the presence of the connected user changes <br/>
             *      status may be <br/>
             *          + "unknow",<br/>
             *          + "online" (with message "" | "mode=auto"),<br/>
             *          + "away" (with message "" ),<br/>
             *          + "xa" (with message ""| "away"),<br/>
             *          + "dnd" (with message "" | "audio" | "video" | "sharing" | "presentation")<br/>
             *      This event is also a confirmation from the server that the new presence value has been set
             */
            that.publishEvent("presencechanged", presence);
        });

        this._evReceiver.on("evt_internal_conversationdeleted", function(conversation) {

            /**
             * @public
             * @event Events#rainbow_onconversationremoved
             * @param { Object } conversation The conversation object
             * @param { String } conversation.conversationId Conversation identifier
             * @description
             *      This event is fired when a conversation has been removed
             */
            that.publishEvent("conversationremoved", conversation);
        });

        this._evReceiver.on("evt_internal_conversationupdated", function(conversation) {

            /**
             * @public
             * @event Events#rainbow_onconversationchanged
             * @param { Conversation } conversation The conversation
             * @description
             *      This event is fired when a conversation has changed
             */
            that.publishEvent("conversationchanged", conversation);
        });

        this._evReceiver.on("evt_internal_allmessagedremovedfromconversationreceived", function(conversation) {

            /**
             * @public
             * @event Events#rainbow_onallmessagedremovedfromconversationreceived
             * @param { Conversation } conversation The conversation where the messages as all been removed.
             * @description
             *      This event is fired when a conversation has changed
             */
            that.publishEvent("allmessagedremovedfromconversationreceived", conversation);
        });

        this._evReceiver.on("evt_internal_chatstate", function(chatstate) {

            /**
             * @public
             * @event Events#rainbow_onchatstate
             * @param { Object } chatstate The chatstate
             * @description
             *      This event is fired when a chatstate event occurs
             */
            that.publishEvent("chatstate", chatstate);
        });

        this._evReceiver.on("evt_internal_contactinformationchanged", function(contact) {

            /**
             * @public
             * @event Events#rainbow_oncontactinformationchanged
             * @param { Contact } contact The contact
             * @description
             *      This event is fired when a conversation has been removed
             */
            that.publishEvent("contactinformationchanged", contact);
        });

        this._evReceiver.on("evt_internal_userinvitereceived", function(invitation) {
            /**
             * @public
             * @event Events#rainbow_onuserinvitereceived
             * @param { Invitation } invitation The invitation received
             * @description
             *      Fired when an user invitation is received
             */
            that.publishEvent("userinvitereceived", invitation);
        });

        this._evReceiver.on("evt_internal_userinviteaccepted", function(invitation) {
            /**
             * @event Events#rainbow_onuserinviteaccepted
             * @public
             * @param { Invitation } invitation The invitation accepted
             * @description
             *      Fired when an user invitation is accepted
             */
            that.publishEvent("userinviteaccepted", invitation);
        });

        this._evReceiver.on("evt_internal_userinvitecanceled", function(invitation) {
            /**
             * @public
             * @event Events#rainbow_onuserinvitecanceled
             * @param { Invitation } invitation The invitation canceled
             * @description
             *      Fired when an user invitation is canceled
             */
            that.publishEvent("userinvitecanceled", invitation);
        });

        this._evReceiver.on("evt_internal_affiliationdetailschanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleaffiliationchanged
             * @public
             * @param { Bubble } bubble The bubble updated
             * @description
             *      Fired when a user changes his affiliation with a bubble
             */
            that.publishEvent("bubbleaffiliationchanged", bubble);
        });

        this._evReceiver.on("evt_internal_bubblepresencechanged", function(bubble) {
            /**
             * @public
             * @event Events#rainbow_onbubblepresencechanged
             * @param { Bubble } bubble The bubble updated
             * @description
             *      Fired when a presence changes is a user connected bubble
             */
            that.publishEvent("bubblepresencechanged", bubble);
        });

        this._evReceiver.on("evt_internal_ownaffiliationdetailschanged", function(bubble) {
            /**
             * @public
             * @event Events#rainbow_onbubbleownaffiliationchanged
             * @param { Bubble } bubble The bubble updated
             * @description
             *      Fired when a user changes the user connected affiliation with a bubble
             */
            that.publishEvent("bubbleownaffiliationchanged", bubble);
        });

        this._evReceiver.on("evt_internal_bubbledeleted", function(bubble) {
            /**
             * @public
             * @event Events#rainbow_onbubbledeleted
             * @param { Bubble } bubble The bubble deleted
             * @description
             *      Fired when a user deletes a bubble the user is affiliated to
             */
            that.publishEvent("bubbledeleted", bubble);
        });

        this._evReceiver.on("evt_internal_invitationdetailsreceived", function(bubble) {
            try {
                if (bubble && bubble.users) {
                    bubble.users.forEach((user) => {
                        if (user && user.jid_im === that._core._rest.loggedInUser.jid_im && user.status === "accepted") {
                            // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                            //that._core.bubbles._sendInitialBubblePresence(bubble);
                            that._core._presence.sendInitialBubblePresence(bubble);
                        }
                    });
                }
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(publishEvent) CATCH Error when evt_internal_invitationdetailsreceived received : ", err);
            }
            /**
             * @event Events#rainbow_onbubbleinvitationreceived
             * @public
             * @param { Bubble } bubble The invitation bubble
             * @description
             *      Fired when an invitation to join a bubble is received
             */
            that.publishEvent("bubbleinvitationreceived", bubble);
        });

        this._evReceiver.on("evt_internal_bubblecustomDatachanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubblecustomdatachanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new custom data set
             * @description
             *      Fired when the custom data of a bubble has changed
             */
            that.publishEvent("bubblecustomdatachanged", bubble);
        });

        this._evReceiver.on("evt_internal_bubbletopicchanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbletopicchanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new topic set
             * @description
             *      Fired when the topic of a bubble has changed
             */
            that.publishEvent("bubbletopicchanged", bubble);
        });

        this._evReceiver.on("evt_internal_bubbleprivilegechanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleprivilegechanged
             * @public
             * @param { {Bubble, String} } bubble The bubble updated with the new privilege set
             *          privilege The privilege updated (Can be moderator, user, owner)
             * @description
             *      Fired when the privilage of a bubble has changed
             */
            that.publishEvent("bubbleprivilegechanged", bubble);
        });

        this._evReceiver.on("evt_internal_bubbleavatarchanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleavatarchanged
             * @public
             * @param { Bubble } bubble The bubble updated with a new avatar
             * @description
             *      Fired when the avatar of a bubble has changed
             */
            that.publishEvent("bubbleavatarchanged", bubble);
        });


        this._evReceiver.on("evt_internal_bubblenamechanged", function(bubble) {
            /**
             * @event Events#rainbow_onbubblenamechanged
             * @public
             * @param { Bubble } bubble The bubble updated with the new name set
             * @description
             *      Fired when the name of a bubble has changed
             */
            that.publishEvent("bubblenamechanged", bubble);
        });

        this._evReceiver.on("evt_internal_groupcreated", function(group) {
            /**
             * @event Events#rainbow_ongroupcreated
             * @public
             * @param { Group } group The created group
             * @description
             *      Fired when a group is created
             */
            that.publishEvent("groupcreated", group);
        });

        this._evReceiver.on("evt_internal_groupdeleted", function(group) {
            /**
             * @event Events#rainbow_ongroupdeleted
             * @public
             * @param { Group } group The deleted group
             * @description
             *      Fired when a group is deleted
             */
            that.publishEvent("groupdeleted", group);
        });

        this._evReceiver.on("evt_internal_groupupdated", function(group) {
            /**
             * @event Events#rainbow_ongroupupdated
             * @public
             * @param { Group } group The updated group
             * @description
             *      Fired when a group is updated
             */
            that.publishEvent("groupupdated", group);
        });

        this._evReceiver.on("evt_internal_useraddedingroup", function(group, contact) {
            /**
             * @event Events#rainbow_onuseraddedingroup
             * @public
             * @param { Group } group The group where the user is added
             * @param { Contact} contact The user added
             * @description
             *      Fired when a user is added in a group
             */
            that.publishEvent("useraddedingroup", group, contact);
        });

        this._evReceiver.on("evt_internal_userremovedfromgroup", function(group, contact) {
            /**
             * @event Events#rainbow_onuserremovedfromgroup
             * @public
             * @param { Group } group The group where the user is removed
             * @param { Contact} contact The user removed
             * @description
             *      Fired when a user is removed from a group
             */
            that.publishEvent("userremovedfromgroup", group, contact);
        });

        this._evReceiver.on("evt_internal_channelmessagereceived", function(message) {
            /**
             * @event Events#rainbow_onchannelmessagereceived
             * @public
             * @param { ChannelMessage } message The message received
             * @description
             *      Fired when a message is received from a channel
             */
            that.publishEvent("channelmessagereceived", message);
        });

        this._evReceiver.on("evt_internal_channelmessagedeletedreceived", function(message) {
            /**
             * @event Events#rainbow_onchannelmessagedeletedreceived
             * @public
             * @param { messageId } message The id of the deleted message received
             * @description
             *      Fired when a message is received from a channel
             */
            that.publishEvent("channelmessagedeletedreceived", message);
        });

        this._evReceiver.on("evt_internal_profilefeatureupdated", function () {
            /**
             * @event Events#rainbow_onprofilefeatureupdated
             * @public
             * @param
             * @description
             *      Fired when a profile feature updated event is received
             */
            that.publishEvent("profilefeatureupdated" );
        });

        this._evReceiver.on("evt_internal_callupdated", function (data) {
            /**
             * @event Events#rainbow_oncallupdated
             * @public
             * @param { data }
             * @description
             *      Fired when a call event is received
             */
            if (data && data.status) {
                //that.publishEvent("callupdated_" + data.status.value, data);
                let eventName = "evt_internal_callupdated_" + data.status.value;
                that._logger.log("internal", LOG_ID + "(publishEvent) FOR AFTERBUILD TESTS : INTERNAL event ", that._logger.colors.events(eventName), " data : ", that._logger.colors.data(data));
                that._evPublisher.emit(eventName, data);
            }
            that.publishEvent("callupdated", data);
        });

        this._evReceiver.on("evt_internal_conferenced", function (data) {
            /**
             * @event Events#rainbow_onconferenced
             * @public
             * @param { data }
             * @description
             *      Fired when a conference event is received
             */
            that.publishEvent("conferenced", data);
        });

        this._evReceiver.on("evt_internal_telephonystatuschanged", function (data) {
            /**
             * @event Events#rainbow_ontelephonystatuschanged
             * @public
             * @param { data }
             * @description
             *      Fired when status of the telephony service event is received
             */
            that.publishEvent("telephonystatuschanged", data);
        });

        this._evReceiver.on("evt_internal_nomadicstatusevent", function (data) {
            /**
             * @event Events#rainbow_onnomadicstatusevent
             * @public
             * @param { data }
             * @description
             *      Fired for nomadic of the telephony event
             */
            that.publishEvent("nomadicstatusevent", data);
        });

        this._evReceiver.on("evt_internal_voicemessageupdated", function (data) {
            /**
             * @event Events#rainbow_onvoicemessageupdated
             * @public
             * @param { data }
             * @description
             *      Fired when a voice message updated event is received
             */
            that.publishEvent("voicemessageupdated", data);
        });

        this._evReceiver.on("evt_internal_callforwarded", function (data) {
            /**
             * @event Events#rainbow_oncallforwarded
             * @public
             * @param { data }
             * @description
             *      Fired when a call forwarded event is received
             */
            that.publishEvent("callforwarded", data);
        });

        this._evReceiver.on("evt_internal_filecreated", function (data) {
            /**
             * @event Events#rainbow_onfilecreated
             * @public
             * @param { data }
             * @description
             *      Fired when a file created event is received
             */
            that.publishEvent("filecreated", data);
        });

        this._evReceiver.on("evt_internal_fileupdated", function (data) {
            /**
             * @event Events#rainbow_onfileupdated
             * @public
             * @param { data }
             * @description
             *      Fired when a file updated event is received
             */
            that.publishEvent("fileupdated", data);
        });

        this._evReceiver.on("evt_internal_filedeleted", function (data) {
            /**
             * @event Events#rainbow_onfiledeleted
             * @public
             * @param { data }
             * @description
             *      Fired when a file deleted event is received
             */
            that.publishEvent("filedeleted", data);
        });

        this._evReceiver.on("evt_internal_thumbnailcreated", function (data) {
            /**
             * @event Events#rainbow_onthumbnailcreated
             * @public
             * @param { data }
             * @description
             *      Fired when a thumbnail created event is received
             */
            that.publishEvent("thumbnailcreated", data);
        });

        /************************* Channels **********************/

        this._evReceiver.on("evt_internal_channelupdated", function (data) {
            /**
             * @event Events#rainbow_onchannelupdated
             * @public
             * @param { String } id The id of the channel
             * @param { Number } kind The kind of change (ADD: 0, UPDATE: 1, REMOVE: 2, SUBSCRIBE: 4, UNSUBSCRIBE: 5)
             * @description
             *      Fired when a channel update event is received
             */
            that.publishEvent("channelupdated", data);
        });

        this._evReceiver.on("evt_internal_channelusersubscription", function (data) {
            /**
             * @event Events#rainbow_onchannelusersubscription
             * @public
             * @param { String } id The id of the channel
             * @param { String } userId The id of the user
             * @param { Number } kind The kind of change (SUBSCRIBE: 4, UNSUBSCRIBE: 5)
             * @description
             *      Fired when a user channel subscription event is received
             */
            that.publishEvent("channelusersubscription", data);
        });

        // ****************** CALLLOGS *********************

        this._evReceiver.on("evt_internal_propose", function (data) {
            /**
             * @event Events#rainbow_onmediapropose
             * @public
             * @param { Object } infos about the proposed for media :
             *  { Contact } infos about the contact who proposed for media
             *  { media } infos about media for the proposed event.
             * @description
             *      Fired when received an event of propose for media.
             */
            that.publishEvent("mediapropose", data);
        });

        this._evReceiver.on("evt_internal_calllogupdated", function (data) {
            /**
             * @event Events#rainbow_oncalllogupdated
             * @public
             * @param { Object } calllogs The callogs of the user
             * @description
             *      Fired when the calllog is updated
             */
            that.publishEvent("calllogupdated", data);
        });

        this._evReceiver.on("evt_internal_calllogackupdated", function (data) {
            /**
             * @event Events#rainbow_oncalllogackupdated
             * @public
             * @param { Object } id The calllog of the user
             * @description
             *      Fired when the number of ack of calllog changes
             */
            that.publishEvent("calllogackupdated", data);
        });

        this._evReceiver.on("evt_internal_favoritecreated", function (data) {
            /**
             * @event Events#rainbow_onfavoritecreated
             * @public
             * @param { Favorite } favorite The favorite created
             * @description
             *      Fired when a favorite is added to the loggued in user.
             */
            that.publishEvent("favoritecreated", data);
        });

        this._evReceiver.on("evt_internal_favoritedeleted", function (data) {
            /**
             * @event Events#rainbow_onfavoritedeleted
             * @public
             * @param { Favorite } favorite The favorite deleted
             * @description
             *      Fired when a favorite is suppressed to the loggued in user.
             */
            that.publishEvent("favoritedeleted", data);
        });

        this._evReceiver.on("evt_internal_xmpperror", function (data) {
            /**
             * @event Events#rainbow_onxmpperror
             * @public
             * @param { Object } error xmpp received.
             * @description
             *      Fired when an XMPP Error events happens.
             */
            that.publishEvent("xmpperror", data);
        });

    }

    get iee(): EventEmitter {
        return this._evReceiver;
    }

    get eee(): EventEmitter {
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
    on(event, callback): EventEmitter {
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
    once(event: string, callback :  (...args: any[]) => void): EventEmitter {
        return this._evPublisher.once(event, callback);
    }

    publish(event: string, data : any): void {

        let info = data || ErrorManager.getErrorManager().OK;

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

        //this._logger.log("info", LOG_ID + "(publish) event " + this._logger.colors.events("rainbow_on" + event) + " : ", info);
        //this._evPublisher.emit("rainbow_on" + event, info);
        this.publishEvent(event, info);
    }

    /**
     * @method publishEvent
     * @private
     * @memberof Events
     * @instance
     * @param {...*} args all arguments for the event
     * @return nothing
     * @description
     *      Add "rainbow_on" prefix to event name, print it human readable, and raises it.
     */
    publishEvent(...args: any[]): void {
        let event;
        let params;
        let that = this;
        [event, ...params] = args;

        let eventName= "rainbow_on" + event;

        that._logger.log("info", LOG_ID + "(publishEvent) event " + that._logger.colors.events(eventName));
        let iter = 0;
        params.forEach((dataIter) => {
            //console.log("EVENT dataIter : ", dataIter);
            //that._logger.log("internal", LOG_ID + "(publishEvent) param ", iter++, " for event ", that._logger.colors.events(eventName), " data : ", dataIter);
            let data = that._logger.argumentsToString(["", dataIter]);
            //console.log("EVENT data : ", data);
            that._logger.log("internal", LOG_ID + "(publishEvent) param ", iter++, " for event ", that._logger.colors.events(eventName), " data : ", that._logger.colors.data(data));

        });

        this._evPublisher.emit(eventName, ...params);
    }

    setCore(_core : Core): void {
        this._core = _core;
    }

}
module.exports.Events = Events;
export {Events};
