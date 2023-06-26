"use strict";
import construct = Reflect.construct;

export {};

import {ErrorManager} from "./ErrorManager.js";
import {EventEmitter} from "events";
import {Core} from "../Core.js";
import {Logger} from "./Logger.js";

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
        that._logger.log("debug", LOG_ID + "EventEmitter(emit) event ", that._logger.colors.eventsEmitter(type));
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
                that._logger.log("debug", LOG_ID + "EventEmitter(on) event ", that._logger.colors.eventsEmitter(event));
                let iter = 0;
                [...params] = args;
                let data = "";
                if (that._logger.logLevel == "debug" && params && Array.isArray(params) ){
                    params.unshift("");
                    data = that._logger.argumentsToString(params, " ,\n");
                    params.shift();
                }
                that._logger.log("internal", LOG_ID + "EventEmitter(on) param ", iter++, " for event ", that._logger.colors.eventsEmitter(event), " data : ", that._logger.colors.data(data));

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
 *      This module fires every events that come from Rainbow.<br>
 *      To receive them, you need to subscribe individually to each of the following events<br>
 * @fires Events#rainbow_onxmmpeventreceived <br>
 * @fires Events#rainbow_onxmmprequestsent <br>
 * @fires Events#rainbow_onrainbowversionwarning <br>
 * @fires Events#rainbow_onmessageserverreceiptreceived <br>
 * @fires Events#rainbow_onmessagereceiptreceived <br>
 * @fires Events#rainbow_onmessagereceiptreadreceived <br>
 * @fires Events#rainbow_onmessagereceived <br>
 * @fires Events#rainbow_onsendmessagefailed <br>
 * @fires Events#rainbow_oncontactpresencechanged <br>
 * @fires Events#rainbow_onpresencechanged <br>
 * @fires Events#rainbow_onconversationremoved <br>
 * @fires Events#rainbow_onconversationchanged <br>
 * @fires Events#rainbow_onallmessagedremovedfromconversationreceived <br>
 * @fires Events#rainbow_onchatstate <br>
 * @fires Events#rainbow_oncontactinformationchanged <br>
 * @fires Events#rainbow_onuserinformationchanged <br>
 * @fires Events#rainbow_onuserinvitereceived <br>
 * @fires Events#rainbow_onuserinviteaccepted <br>
 * @fires Events#rainbow_onuserinvitecanceled <br>
 * @fires Events#rainbow_oncontactremovedfromnetwork <br>
 * @fires Events#rainbow_onbubbleaffiliationchanged <br>
 * @fires Events#rainbow_onbubblepresencechanged <br>
 * @fires Events#rainbow_onbubbleownaffiliationchanged <br>
 * @fires Events#rainbow_onbubbledeleted <br>
 * @fires Events#rainbow_onbubbleinvitationreceived <br>
 * @fires Events#rainbow_onbubblecontactinvitationreceived <br>
 * @fires Events#rainbow_onbubbleconferencestartedreceived <br>
 * @fires Events#rainbow_onbubbleconferencestoppedreceived <br>
 * @fires Events#rainbow_onbubbleconferencedelegatereceived <br>
 * @fires Events#rainbow_onbubbleconferenceupdated <br>
 * @fires Events#rainbow_onbubblecustomdatachanged <br>
 * @fires Events#rainbow_onbubbletopicchanged <br>
 * @fires Events#rainbow_onbubbleprivilegechanged <br>
 * @fires Events#rainbow_onbubbleavatarchanged <br>
 * @fires Events#rainbow_onbubblenamechanged <br>
 * @fires Events#rainbow_onopeninvitationupdate <br>
 * @fires Events#rainbow_ongroupcreated <br>
 * @fires Events#rainbow_ongroupdeleted <br>
 * @fires Events#rainbow_ongroupupdated <br>
 * @fires Events#rainbow_onuseraddedingroup <br>
 * @fires Events#rainbow_onuserremovedfromgroup <br>
 * @fires Events#rainbow_onstarted <br>
 * @fires Events#rainbow_onstopped <br>
 * @fires Events#rainbow_onready <br>
 * @fires Events#rainbow_onerror <br>
 * @fires Events#rainbow_onconnected <br>
 * @fires Events#rainbow_onconnectionerror <br>
 * @fires Events#rainbow_ondisconnected <br>
 * @fires Events#rainbow_onreconnecting <br>
 * @fires Events#rainbow_onfailed <br>
 * @fires Events#rainbow_oncallupdated <br>
 * @fires Events#rainbow_onconferenced <br>
 * @fires Events#rainbow_ontelephonystatuschanged <br>
 * @fires Events#rainbow_onnomadicstatusevent <br>
 * @fires Events#rainbow_onvoicemessageupdated <br>
 * @fires Events#rainbow_onvoicemessagesinfo <br>
 * @fires Events#rainbow_oncallforwarded <br>
 * @fires Events#rainbow_onchannelmessagereceived <br>
 * @fires Events#rainbow_onchannelmyappreciationreceived <br>
 * @fires Events#rainbow_onchannelmessagedeletedreceived <br>
 * @fires Events#rainbow_onprofilefeatureupdated <br>
 * @fires Events#rainbow_onfilecreated <br>
 * @fires Events#rainbow_onfileupdated <br>
 * @fires Events#rainbow_onfiledeleted <br>
 * @fires Events#rainbow_onthumbnailcreated <br>
 * @fires Events#rainbow_onwebinarupdated <br>
 * @fires Events#rainbow_onchannelupdated <br>
 * @fires Events#rainbow_onchannelusersubscription <br>
 * @fires Events#rainbow_onmediapropose <br>
 * @fires Events#rainbow_onmediaretract <br>
 * @fires Events#rainbow_oncalllogupdated <br>
 * @fires Events#rainbow_oncalllogackupdated <br>
 * @fires Events#rainbow_onfavoritecreated <br>
 * @fires Events#rainbow_onfavoriteupdated <br>
 * @fires Events#rainbow_onfavoritedeleted <br>
 * @fires Events#rainbow_onxmpperror <br>
 * @fires Events#rainbow_onalertmessagereceived <br>
 * @fires Events#rainbow_onbubblescontainercreated <br>
 * @fires Events#rainbow_onbubblescontainerupdated <br>
 * @fires Events#rainbow_onbubblescontainerdeleted <br>
 * @fires Events#rainbow_onusertokenrenewfailed <br>
 * @fires Events#rainbow_onusertokenwillexpire <br>
 * @fires Events#rainbow_onbubblepollcreated <br>
 * @fires Events#rainbow_onbubblepolldeleted <br>
 * @fires Events#rainbow_onbubblepollpublished <br>
 * @fires Events#rainbow_onbubblepollunpublished <br>
 * @fires Events#rainbow_onbubblepollterminated <br>
 * @fires Events#rainbow_onbubblepollupdated <br>
 * @fires Events#rainbow_onbubblepollvoted <br>
 * @fires Events#rainbow_onconnectorcommand <br>
 * @fires Events#rainbow_onconnectorconfig <br>
 * @fires Events#rainbow_onconnectorcommandended <br>
 * @fires Events#rainbow_onconnectorimportstatus <br>
 * @fires Events#rainbow_onrbvoicerawevent <br>
 * @fires Events#rainbow_onjoincompanyinvitereceived <br>
 * @fires Events#rainbow_onjoincompanyrequestreceived <br>
*/
class Events {
    get logEmitter(): EventEmitter {
        return this._logEmitter;
    }

    set logEmitter(value: EventEmitter) {
        this._logEmitter = value;
    }
	public _logger: Logger;
	public _filterCallback: Function;
	public _evReceiver: EventEmitter;
	public _evPublisher: EventEmitter;
	public _core: Core;
    private _logEmitter: EventEmitter;

    public sdkPublicEventsName = [
        "rainbow_onxmmpeventreceived",
        "rainbow_onxmmprequestsent",
        "rainbow_onrainbowversionwarning",
        "rainbow_onmessageserverreceiptreceived",
        "rainbow_onmessagereceiptreceived",
        "rainbow_onmessagereceiptreadreceived",
        "rainbow_onmessagereceived",
        "rainbow_onsendmessagefailed",
        "rainbow_oncontactpresencechanged",
        "rainbow_onpresencechanged",
        "rainbow_onconversationremoved",
        "rainbow_onconversationchanged",
        "rainbow_onallmessagedremovedfromconversationreceived",
        "rainbow_onchatstate",
        "rainbow_oncontactinformationchanged",
        "rainbow_onuserinformationchanged",
        "rainbow_onuserinvitereceived",
        "rainbow_onuserinviteaccepted",
        "rainbow_onuserinvitecanceled",
        "rainbow_oncontactremovedfromnetwork",
        "rainbow_onbubbleaffiliationchanged",
        "rainbow_onbubblepresencechanged",
        "rainbow_onbubbleownaffiliationchanged",
        "rainbow_onbubbledeleted",
        "rainbow_onbubbleinvitationreceived",
        "rainbow_onbubblecontactinvitationreceived",
        "rainbow_onbubbleconferencestartedreceived",
        "rainbow_onbubbleconferencestoppedreceived",
        "rainbow_onbubbleconferencedelegatereceived",
        "rainbow_onbubbleconferenceupdated",
        "rainbow_onbubblecustomdatachanged",
        "rainbow_onbubbletopicchanged",
        "rainbow_onbubbleprivilegechanged",
        "rainbow_onbubbleavatarchanged",
        "rainbow_onbubblenamechanged",
        "rainbow_onopeninvitationupdate",
        "rainbow_ongroupcreated",
        "rainbow_ongroupdeleted",
        "rainbow_ongroupupdated",
        "rainbow_onuseraddedingroup",
        "rainbow_onuserremovedfromgroup",
        "rainbow_onstarted",
        "rainbow_onstopped",
        "rainbow_onready",
        "rainbow_onerror",
        "rainbow_onconnected",
        "rainbow_onconnectionerror",
        "rainbow_ondisconnected",
        "rainbow_onreconnecting",
        "rainbow_onfailed",
        "rainbow_oncallupdated",
        "rainbow_onconferenced",
        "rainbow_ontelephonystatuschanged",
        "rainbow_onnomadicstatusevent",
        "rainbow_onvoicemessageupdated",
        "rainbow_onvoicemessagesinfo",
        "rainbow_oncallforwarded",
        "rainbow_onchannelmessagereceived",
        "rainbow_onchannelmyappreciationreceived",
        "rainbow_onchannelmessagedeletedreceived",
        "rainbow_onprofilefeatureupdated",
        "rainbow_onfilecreated",
        "rainbow_onfileupdated",
        "rainbow_onfiledeleted",
        "rainbow_onthumbnailcreated",
        "rainbow_onwebinarupdated",
        "rainbow_onchannelupdated",
        "rainbow_onchannelusersubscription",
        "rainbow_onmediapropose",
        "rainbow_onmediaretract",
        "rainbow_oncalllogupdated",
        "rainbow_oncalllogackupdated",
        "rainbow_onfavoritecreated",
        "rainbow_onfavoriteupdated",
        "rainbow_onfavoritedeleted",
        "rainbow_onxmpperror",
        "rainbow_onalertmessagereceived",
        "rainbow_onbubblescontainercreated",
        "rainbow_onbubblescontainerupdated",
        "rainbow_onbubblescontainerdeleted",
        "rainbow_onusertokenrenewfailed",
        "rainbow_onusertokenwillexpire",
        "rainbow_onbubblepollcreated",
        "rainbow_onbubblepolldeleted",
        "rainbow_onbubblepollpublished",
        "rainbow_onbubblepollunpublished",
        "rainbow_onbubblepollterminated",
        "rainbow_onbubblepollupdated",
        "rainbow_onbubblepollvoted",
        "rainbow_onconnectorcommand",
        "rainbow_onconnectorconfig",
        "rainbow_onconnectorcommandended",
        "rainbow_onconnectorimportstatus",
        "rainbow_onrbvoicerawevent",
        "rainbow_onjoincompanyinvitereceived",
        "rainbow_onjoincompanyrequestreceived"
    ];
    public  waitBeforeBubblePresenceSend = false;

    constructor( _logger : Logger, _filterCallback : Function) {
        let that = this;

        this._logger = _logger;
        this._filterCallback = _filterCallback;

        this._evReceiver = new Emitter(this._logger);

        this._evPublisher = new EventEmitter();

        this._logEmitter = new EventEmitter();

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

        this._evReceiver.on("evt_internal_xmmpeventreceived", function(...args) {

            /**
             * @event Events#rainbow_onxmmpeventreceived
             * @public
             * @description
             *      Fired when a xmpp message is received.
             */
            that.publishEvent("xmmpeventreceived", ...args);
        });

        this._evReceiver.on("evt_internal_xmmprequestsent", function(...args) {

            /**
             * @event Events#rainbow_onxmmprequestsent
             * @public
             * @description
             *      Fired when an xmpp request is sent.
             */
            that.publishEvent("xmmprequestsent", ...args);
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

        //this._evReceiver.on("evt_internal_presencechanged", function(presence) {
        this._evReceiver.on("evt_internal_mypresencechanged", function(presence) {

            /**
             * @event Events#rainbow_onpresencechanged
             * @public
             * @param {Object} presence The presence object updated (jid, status, message, stamp)
             * @description
             *      This event is fired when the presence of the connected user changes <br>
             *      presence may be <br>
             *          + "unknow",<br>
             *          + "online" (with status "" | "mode=auto"),<br>
             *          + "away" (with status "" | "away"),<br>
             *          + "offline" (with status ""),<br>
             *          + "invisible" (with status ""),<br>
             *          + "dnd" (with status "" | "audio" | "video" | "sharing" | "presentation")<br>
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

        this._evReceiver.on("evt_internal_informationchanged", function(contact) {

            /**
             * @public
             * @event Events#rainbow_onuserinformationchanged
             * @param { Contact } contact The connected user
             * @description
             *      This event is fired when informations about the connected user changed.
             */
            that.publishEvent("userinformationchanged", contact);
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
             *      Note :
             *      A contact is added to connected user's network when this contact accepts the invitation, so the event raised is `rainbow_onuserinviteaccepted` instead of a `rainbow_contactaddedtonetwork`
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

        this._evReceiver.on("evt_internal_contactremovedfromnetwork", function(invitation) {
            /**
             * @public
             * @event Events#rainbow_oncontactremovedfromnetwork
             * @param { Object } contact { jid , subscription, ask } The information of the subscrition of the contact removed from network.
             * @description
             *      Fired when a contact is removed from connected user's network.
             *      Note :
             *      A contact is added to connected user's network when this contact accepts the invitation, so the event raised is `rainbow_onuserinviteaccepted` instead of a `rainbow_contactaddedtonetwork`
             */
            that.publishEvent("contactremovedfromnetwork", invitation);
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

        this._evReceiver.on("evt_internal_invitationdetailsreceived", async function(bubble) {
            try {
                if (bubble && bubble.users) {
                    //bubble.users.forEach(async (user) => {
                        for (const user of bubble.users) {
                            if (that._core.options._imOptions.autoInitialBubblePresence) {
                                if (user && user.jid_im===that._core._rest.loggedInUser.jid_im && user.status==="accepted") {
                                    // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                                    await that._core._presence.sendInitialBubblePresenceSync(bubble);
                                }
                            } else {
                                that._logger.log("internal", LOG_ID + "(publishEvent) autoInitialBubblePresence disabled, so do not send initial bubble presence.");
                            }
                        }
                    //});
                    
                    /*
                    bubble.users.forEach(async (user) => {
                            if (that._core.options._imOptions.autoInitialBubblePresence) {
                                if (user && user.jid_im===that._core._rest.loggedInUser.jid_im && user.status==="accepted") {
                                    // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                                    //that._core.bubbles._sendInitialBubblePresence(bubble);
                                    await that._core._presence.sendInitialBubblePresence(bubble);
                                }
                            } else {
                                that._logger.log("internal", LOG_ID + "(publishEvent) autoInitialBubblePresence disabled, so do not send initial bubble presence.");
                            }
                    });
                    
                    /*
                    bubble.users.forEach(async (user) => {
                        if (that._core.options._imOptions.autoInitialBubblePresence) {
                            if (user && user.jid_im===that._core._rest.loggedInUser.jid_im && user.status==="accepted") {
                                // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                                //that._core.bubbles._sendInitialBubblePresence(bubble);
                                if (that.waitBeforeBubblePresenceSend) {
                                    that._logger.log("debug", LOG_ID + "(evt_internal_invitationdetailsreceived) foreach send initial presence to room : ", bubble.jid, " in a timer of 15 seconds.");
                                    await setTimeoutPromised(15000);
                                } else {
                                    that._logger.log("debug", LOG_ID + "(evt_internal_invitationdetailsreceived) foreach send initial presence to room : ", bubble.jid, " without timer.");
                                }

                                await that._core._presence.sendInitialBubblePresence(bubble);
                            }
                        } else {
                            that._logger.log("internal", LOG_ID + "(publishEvent) autoInitialBubblePresence disabled, so do not send initial bubble presence.");
                        }
                    }); // */
                    
                    /*
                    for (const user of bubble.users) {
                        if (that._core.options._imOptions.autoInitialBubblePresence) {
                            if (user && user.jid_im === that._core._rest.loggedInUser.jid_im && user.status === "accepted") {
                                // this._core._xmpp.sendInitialBubblePresence(bubble.jid);
                                //that._core.bubbles._sendInitialBubblePresence(bubble);
                                if (that.waitBeforeBubblePresenceSend)
                                {
                                    that._logger.log("debug", LOG_ID + "(evt_internal_invitationdetailsreceived) send initial presence to room : ", bubble.jid, " in a timer of 15 seconds.");
                                    await setTimeoutPromised(15000);
                                } else {
                                    that._logger.log("debug", LOG_ID + "(evt_internal_invitationdetailsreceived) send initial presence to room : ", bubble.jid , " without timer.");
                                }
                                await that._core._presence.sendInitialBubblePresence(bubble);
                                that._logger.log("debug", LOG_ID + "(evt_internal_invitationdetailsreceived) initial bubble presence sent.");
                            }
                        } else {
                            that._logger.log("internal", LOG_ID + "(evt_internal_invitationdetailsreceived) autoInitialBubblePresence disabled, so do not send initial bubble presence.");
                        }
                    };
                    // */
                }
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(evt_internal_invitationdetailsreceived) CATCH Error when evt_internal_invitationdetailsreceived received : ", err);
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
        
        this._evReceiver.on("evt_internal_contactinvitationdetailsreceived", async function(invitation) {
            /**
             * @event Events#rainbow_onbubblecontactinvitationreceived
             * @public
             * @param { any } invitation The invitation bubble {contact: Contact, bubble: Bubble, content: string, subject:string}
             * @description
             *      Fired when an invitation to join a bubble is received for a contact.
             */
            that.publishEvent("bubblecontactinvitationreceived", invitation);
        });

        this._evReceiver.on("evt_internal_bubbleconferencestartedreceived", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleconferencestartedreceived
             * @public
             * @param { Bubble } bubble The bubble of the conference started.
             * @description
             *      Fired when an event conference start in a bubble is received
             */
            that.publishEvent("bubbleconferencestartedreceived", bubble);
        });

        this._evReceiver.on("evt_internal_bubbleconferencestoppedreceived", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleconferencestoppedreceived
             * @public
             * @param { Bubble } bubble The bubble of the conference stopped.
             * @description
             *      Fired when an event conference stop in a bubble is received
             */
            that.publishEvent("bubbleconferencestoppedreceived", bubble);
        });

        this._evReceiver.on("evt_internal_bubbleconferencedelegatereceived", function(bubble) {
            /**
             * @event Events#rainbow_onbubbleconferencedelegatereceived
             * @public
             * @param { Bubble } bubble The bubble of the conference stopped.
             * @param { Bubble } userIdEvent The id of the user getting the delegation of conference.
             * @description
             *      Fired when an event conference delegate in a bubble is received
             */
            that.publishEvent("bubbleconferencedelegatereceived", bubble);
        });

        
        // this._evReceiver.on("evt_internal_bubbleconferenceparticipantlistupdated", function(bubble) {
        //     /**
        //      * @event Events#rainbow_onbubbleconferenceparticipantlistupdated
        //      * @public
        //      * @param { WebConferenceSession } conference The conference with participant added.
        //      * @description
        //      *      Fired when an event conference stop in a bubble is received
        //      */
        //     that.publishEvent("bubbleconferenceparticipantlistupdated", bubble);
        // });
        //
        // this._evReceiver.on("evt_internal_bubbleconferenceendinvitation", function(bubble) {
        //     /**
        //      * @event Events#rainbow_onbubbleconferenceendinvitation
        //      * @public
        //      * @param { Bubble } conference The conference with participant added.
        //      * @param { } updatedDatasForEvent participants added or removed
        //      * @description
        //      *      Fired when an event conference leaved a bubble is received
        //      */
        //     that.publishEvent("bubbleconferenceendinvitation", bubble);
        // });

        this._evReceiver.on("evt_internal_bubbleconferenceupdated", function(bubble, updatedDatasForEvent) {
            /**
             * @event Events#rainbow_onbubbleconferenceupdated
             * @public
             * @param { Object } conference The conference is updated.
             * @description
             *      Fired when an event conference is updated.
             */
            that.publishEvent("bubbleconferenceupdated", bubble, updatedDatasForEvent);
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

        this._evReceiver.on("evt_internal_openinvitationUpdate", function(openInvite) {
            /**
             * @event Events#rainbow_onopeninvitationupdate
             * @public
             * @param { Object } openInvite The informations about the a management event on a public URL share of a bubble.
             * @description
             *      Fired when a management event on a public URL share of a bubble has changed
             */
            that.publishEvent("openinvitationupdate", openInvite);
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

        this._evReceiver.on("evt_internal_channelmyappreciationreceived", function(appreciation) {
            /**
             * @event Events#rainbow_onchannelmyappreciationreceived
             * @public
             * @param { Object } appreciation The appreciation received
             * @description
             *      Fired when a message is received from a channel
             */
            that.publishEvent("channelmyappreciationreceived", appreciation);
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

        this._evReceiver.on("evt_internal_voicemessagesinfo", function (data) {
            /**
             * @event Events#rainbow_onvoicemessagesinfo
             * @public
             * @param { data }
             * @description
             *      Fired when voice messages infos updated event is received
             */
            that.publishEvent("voicemessagesinfo", data);
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

        /************************* Webinar **********************/

        this._evReceiver.on("evt_internal_webinarupdated", function (data) {
            /**
             * @event Events#rainbow_onwebinarupdated
             * @public
             * @param { String } id The id of the channel
             * @param { Number } kind The kind of change (ADD: 0, REMOVE: 2)
             * @description
             *      Fired when a webinar update event is received
             */
            that.publishEvent("webinarupdated", data);
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

        // ****************** WEBRTC ***********************
        
        this._evReceiver.on("evt_internal_propose", function (data) {
            /**
             * @event Events#rainbow_onmediapropose
             * @public
             * @param { Object } data infos about the proposed for media : <br>
             *  { Contact } data.contact infos about the contact who proposed for media<br>
             *  { string } data.xmlns namespace of the propose action<br>
             *  { string } data.resource resource the resource that has sent the proposed event.<br>
             *  { Object } data.description { media : string, xmlns :string } infos about media for the proposed event.<br>
             *  { Object } data.unifiedplan { xmlns : string } information about the version stack proposed. <br>
             *  { string } data.id id of the propose action, can be used to follow the call if retractected.<br>
             * @description
             *      Fired when received an event of propose for media.
             */
            that.publishEvent("mediapropose", data);
        });

        this._evReceiver.on("evt_internal_retract", function (data) {
            /**
             * @event Events#rainbow_onmediaretract
             * @public
             * @param { Object } data infos about the proposed for media : <br>
             *  { Contact } data.contact infos about the contact who proposed for media<br>
             *  { resource } data.resource the resource that has sent the proposed event.<br>
             *  { string } data.xmlns namespace of the propose action<br>
             *  { string } data.id id of the retract action, it is the call propose id received before.<br>
             * @description
             *      Fired when received an event of propose for media.
             */
            that.publishEvent("mediaretract", data);
        });
        
        this._evReceiver.on("evt_internal_accept", function (data) {
            /**
             * @event Events#rainbow_onmediaaccept
             * @public
             * @param { Object } data infos about the accept Webrtc call : <br>
             *  { Contact } data.contact infos about the contact who accept for media<br>
             *  { resource } data.resource the resource that has sent the accept event.<br>
             *  { string } data.xmlns namespace of the accept action<br>
             *  { string } data.id id of the accept action, it is the call propose id received before.<br>
             * @description
             *      Fired when received an event of accept for media.
             */
            that.publishEvent("mediaaccept", data);
        });
        
        // ****************** CALLLOGS *********************

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

        this._evReceiver.on("evt_internal_favoriteupdated", function (data) {
            /**
             * @event Events#rainbow_onfavoriteupdated
             * @public
             * @param { Favorite } favorite The favorite updated
             * @description
             *      Fired when a favorite is updated to the loggued in user.
             */
            that.publishEvent("favoriteupdated", data);
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

        this._evReceiver.on("evt_internal_alertmessagereceived", function (data) {
            /**
             * @event Events#rainbow_onalertmessagereceived
             * @public
             * @param { AlertMessage } Alert received.
             * @description
             *      Fired when an Alert events happens.
             */
            that.publishEvent("alertmessagereceived", data);
        });

        this._evReceiver.on("evt_internal_bubblescontainercreated", function (data) {
            /**
             * @event Events#rainbow_onbubblescontainercreated
             * @public
             * @param { Object } data informations about container and bubbles linked
             * containerName: string The name of the container.
             * containerId: string The id of the container.
             * containerDescription: string The description of the container.
             * bubblesAdded: Array<Bubble> list of bubbles added
             * bubblesRemoved: Array<Bubble> list of bubbles removed
             * @description
             *      Fired when a container of bubbles created event is received
             */
            that.publishEvent("bubblescontainercreated", data);
        });

        this._evReceiver.on("evt_internal_bubblescontainerupdated", function (data) {
            /**
             * @event Events#rainbow_onbubblescontainerupdated
             * @public
             * @param { Object } data informations about container and bubbles linked
             * containerName: string, The name of the container.
             * containerId: string, The id of the container.
             * containerDescription: string The description of the container.
             * bubblesAdded: Array<Bubble> list of bubbles added
             * bubblesRemoved: Array<Bubble> list of bubbles removed
             * @description
             *      Fired when a container of bubbles updated event is received
             */
            that.publishEvent("bubblescontainerupdated", data);
        });

        this._evReceiver.on("evt_internal_bubblescontainerdeleted", function (data) {
            /**
             * @event Events#rainbow_onbubblescontainerdeleted
             * @public
             * @param { Object } data informations about container and bubbles linked
             * containerName: string, The name of the container.
             * containerId: string, The id of the container.
             * containerDescription: string The description of the container.
             * bubblesAdded: Array<Bubble> list of bubbles added
             * bubblesRemoved: Array<Bubble> list of bubbles removed
             * @description
             *      Fired when a container of bubbles deleted event is received
             */
            that.publishEvent("bubblescontainerdeleted", data);
        });

        this._evReceiver.on("evt_internal_onusertokenrenewfailed", function (data) {
            /**
             * @event Events#rainbow_onusertokenrenewfailed
             * @public
             * @param { Object } data informations about token expired
             * @description
             *      Fired when an oauth token is expired event is received.
             *      Application must refresh the token and send it back to SDK with `setRenewedToken` API.
             */
            that.publishEvent("usertokenrenewfailed", data);
        });

        this._evReceiver.on("evt_internal_onusertokenwillexpire", function (data) {
            /**
             * @event Events#rainbow_onusertokenwillexpire
             * @public
             * @param { Object } data informations about token expired
             * @description
             *      This event is fired when the duration of the current user token reaches half of the maximum time. 
             *      For instance, if the token is valid for 1 hour, this event will arrive at 30 minutes.
             *      Application must refresh the token and send it back to SDK with `setRenewedToken` API.
             *      It is recommended to renew the token upon the arrival of this event.
             */
            that.publishEvent("usertokenwillexpire", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_create", function (data) {
            /**
             * @event Events#rainbow_onbubblepollcreated
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is created in bubble.
             */
            that.publishEvent("bubblepollcreated", data);
        });

        /*this._evReceiver.on("evt_internal_bubble_poll_delete", function (data) {
            /**
             * @event Events#rainbow_onbubblepolldeleted
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is deleted in bubble.
             */
/*            that.publishEvent("bubblepolldeleted", data);
        });
// */

        this._evReceiver.on("evt_internal_bubble_poll_pollPublish", function (data) {
            /**
             * @event Events#rainbow_onbubblepollpublished
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is Published in bubble.
             */
            that.publishEvent("bubblepollpublished", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_pollUnpublish", function (data) {
            /**
             * @event Events#rainbow_onbubblepollunpublished
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is unpublished in bubble.
             */
            that.publishEvent("bubblepollunpublished", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_pollTerminate", function (data) {
            /**
             * @event Events#rainbow_onbubblepollterminated
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is terminated in bubble.
             */
            that.publishEvent("bubblepollterminated", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_pollDelete", function (data) {
            /**
             * @event Events#rainbow_onbubblepolldeleted
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is deleted in bubble.
             */
            that.publishEvent("bubblepolldeleted", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_update", function (data) {
            /**
             * @event Events#rainbow_onbubblepollupdated
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is updated in bubble.
             */
            that.publishEvent("bubblepollupdated", data);
        });

        this._evReceiver.on("evt_internal_bubble_poll_pollVote", function (data) {
            /**
             * @event Events#rainbow_onbubblepollvoted
             * @public
             * @param { Object } data informations about poll 
             * @description
             *      This event is fired when a poll is voted in bubble.
             */
            that.publishEvent("bubblepollvoted", data);
        });

        this._evReceiver.on("evt_internal_connectorcommand", function (data) {
            /**
             * @event Events#rainbow_onconnectorcommand
             * @public
             * @param { Object } data informations about connector command 
             * @description
             *      This event is fired when a command is sent to connector's jid_im.
             */
            that.publishEvent("connectorcommand", data);
        });

        this._evReceiver.on("evt_internal_connectorconfig", function (data) {
            /**
             * @event Events#rainbow_onconnectorconfig
             * @public
             * @param { Object } data informations about connector config 
             * @description
             *      This event is fired when a config is sent to connector's jid_im.
             */
            that.publishEvent("connectorconfig", data);
        });

        this._evReceiver.on("evt_internal_connectorcommand_ended", function (data) {
            /**
             * @event Events#rainbow_onconnectorcommandended
             * @public
             * @param { Object } data informations about connector command
             * @description
             *      This event is fired in case a query parameter commandId is added to the AdminService::checkCSVdataForSynchronizeDirectory method.
             */
            that.publishEvent("connectorcommand_ended", data);
        });

        this._evReceiver.on("evt_internal_connectorimportstatus", function (data) {
            /**
             * @event Events#rainbow_onconnectorimportstatus
             * @public
             * @param { Object } data informations about connector import status
             * @description
             *      This event is fired in case an import is requested.
             */
            that.publishEvent("connectorimportstatus", data);
        });

        this._evReceiver.on("evt_internal_onrbvoiceevent", function (data) {
            /**
             * @event Events#rainbow_onrbvoicerawevent
             * @public
             * @param { Object } data informations about rainbow voice events
             * @description
             *      This event is fired in case a of rainbow voice event.
             */
            that.publishEvent("rbvoicerawevent", data);
        });

        this._evReceiver.on("evt_internal_joincompanyinvitereceived", function (data) {
            /**
             * @event Events#rainbow_onjoincompanyinvitereceived
             * @public
             * @param { Object } data informations about rainbow join company invite events
             * @description
             *      This event is fired in case a of rainbow join company invite event.
             */
            that.publishEvent("joincompanyinvitereceived", data);
        });

        this._evReceiver.on("evt_internal_joincompanyrequestreceived", function (data) {
            /**
             * @event Events#rainbow_onjoincompanyrequestreceived
             * @public
             * @param { Object } data informations about rainbow join company request events
             * @description
             *      This event is fired in case a of rainbow join company request event.
             */
            that.publishEvent("joincompanyrequestreceived", data);
        });

    }

    get iee(): EventEmitter {
        return this._evReceiver;
    }

    get eee(): EventEmitter {
        return this._evPublisher;
    }

    /**
     * @method onLog
     * @public
     * @memberof Events
     * @instance
     * @param {string} event The event name to subscribe
     * @param {function} callback The function called when the even is fired
     * @return {Object} The events instance to be able to chain subscriptions
     * @description
     *      Subscribe to an event raised when a log is done.
     */
    onLog(event, callback): EventEmitter {
        return this._logEmitter.on(event, callback);
    }

    /**
     * @method removeLogListener
     * @public
     * @memberof Events
     * @instance
     * @param {string} event The event name to unsubscribe
     * @param {function} callback The function called when the even is fired
     * @return {Object} The events instance to be able to chain subscriptions
     * @description
     *      Unsubscribe to an event raised when a log is done.
     */
    removeLogListener(event, callback){
        return this._logEmitter.removeListener(event, callback);
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
     * @method emit
     * @private
     * @memberof Events
     * @instance
     * @param {string} eventName name for the event
     * @param {any} data arguments for the event
     * @return nothing
     * @description
     *      Emit an event.
     */
    emit(eventName, data) : void {
        this.iee.emit(eventName, data);
    }

    /**
     * @method removeListener
     * @public
     * @memberof Events
     * @instance
     * @param {string} eventName The event name to unsubscribe
     * @param {function} listener The listener called when the even is fired
     * @return {Object} The events instance to be able to remove a subscription from chain.
     * @description
     *      Unsubscribe to an event
     */
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): EventEmitter {
        return this._evPublisher.removeListener(eventName, listener);
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
        let data = "";
        if (that._logger.logLevel == "debug" && params && Array.isArray(params) ){
            params.unshift("");
            data = that._logger.argumentsToString(params, " ,\n");
            /*params.forEach((dataIter) => {
                //console.log("EVENT dataIter : ", dataIter);
                //that._logger.log("internal", LOG_ID + "(publishEvent) param ", iter++, " for event ", that._logger.colors.events(eventName), " data : ", dataIter);
                let data = that._logger.argumentsToString(["", dataIter]);
                //console.log("EVENT data : ", data);
                that._logger.log("internal", LOG_ID + "(publishEvent) param ", iter++, " for event ", that._logger.colors.events(eventName), " data : ", that._logger.colors.data(data));
    
            }); //  */
            params.shift();
        }
        that._logger.log("internal", LOG_ID + "(publishEvent) param ", iter++, " for event ", that._logger.colors.eventsEmitter(eventName), " data : ", that._logger.colors.data(data));
        
        that._evPublisher.emit(eventName, ...params);
    }

    setCore(_core : Core): void {
        this._core = _core;
    }

}
// module.exports.Events = Events;
export {Events};
