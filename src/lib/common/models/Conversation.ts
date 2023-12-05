"use strict";



//const Call = require("./Call");
import {Call} from "./Call.js";
//const uuid4 = require("uuid/v4");
import { v4 as uuid4 } from 'uuid';
import {Message} from "./Message.js";
import {Logger} from "../Logger.js";

const LOG_ID = "CONVERSATION/CONV - ";

/**
 * @class
 * @name Conversation
 * @public
 * @description
 *      This class represents a conversation <br>
 *		A conversation is a "long" interaction (aka the "long tail") between the user ane one or several contacts (Rainbow users or not) based on the IM media if the recipients are Rainbow users. <br>
 *		A conversation never ends and all interactions done can be retrieved. <br>
 */
class Conversation {
    get messages(): any {
        //this.logger.log("internal", LOG_ID + "(get messages) id : ", this.id, ", get messages : ", this._messages);
        return this._messages;
    }
    set messages(value: any) {
        //this.logger.log("internal", LOG_ID + "(set messages) id : ", this.id, ", set messages : ", value);
        this._messages = value;
    }
    updateMessages(index: number , value: any) {
        //this.logger.log("internal", LOG_ID + "(updateMessages) id : ", this.id, ", add message : ", value);
        this._messages[index] = value;
    }
	public id: any;
	public dbId: any;
	public type: any;
	public owner: any;
	public contact: any;
	public bubble: any;
	public capabilities: any;
	public avatar: any;
	public presenceStatus: any;
	public name: any;
	public filterName: any;
	public missedCounter: any;
	public missedCalls: any;
	private _messages: any;
	public participantStatuses: any;
	public draft: any;
	public uploadFile: any;
	public status: any;
	public historyIndex: any;
	public historyMessages: any;
	public historyDefered: any;
	public historyComplete: any;
	public lastModification: any;
	public creationDate: any;
	public lastMessageText: any;
	public lastMessageSender: any;
	public pip: any;
	public videoCall: any;
	public audioCall: any;
	public pstnConferenceSession: any;
	public webConferenceSession: any;
	public isMutedAudio: any;
	public isMutedVideo: any;
	public infoVisible: any;
	public muted: any;
	public randomBase: any;
	public messageId: any;
	public currentHistoryId: any;
    public static Status: any;
    public static Type: any;
    private static randomBase: string;
    private static messageId: string;
    preload: boolean;
    isFavorite: boolean;
    bookmark : {
        "messageId" : string,
        "timestamp" : string,
        "unreadMessageNumber" : string
    };
    pendingPromise: Array<any>;
    private logger : any;


    constructor(conversationId, logger : Logger) {
        /**
         * @public
         * @property {string} id The conversation ID
         * @readonly
         */
        this.id = conversationId;

        this.logger = logger ? logger : console;        
        
        /**
         * @public
         * @property {string} dbId The database ID
         * @readonly
         */
        this.dbId = null;

        /**
         * @public
         * @property {ConversationType} type The type of the conversation. Can be ONE_TO_ONE (0), BUBBLE (1) or BOT (2)
         * @readonly
         */
        this.type = null;

        /**
         * @private
         * @readonly
         */
        this.owner = null;

        /**
         * @public
         * @property {Contact} contact (ONE_TO_ONE conversation only) The recipient of the conversation
         * @link Contact
         * @readonly
         */
        this.contact = null;

        /**
         * @public
         * @property {Bubble} bubble (BUBBLE conversation only) The conversation bubble
         * @link Bubble
         * @readonly
         */
        this.bubble = null;

        /**
         * @public
         * @property {Object} capabilities The capabilities of the conversation
         * @readonly
         */
        this.capabilities = null;

        // Display information

        /**
         * @public
         * @property {Object} avatar (ONE_TO_ONE conversation only) The avatar of the conversation
         * @readonly
         */
        this.avatar = null;

        /**
         * @private
         * @readonly
         */
        this.presenceStatus = null;

        /**
         * @private
         * @readonly
         */
        this.name = function () {
            return {};
        };

        /**
         * @public
         * @property {string} filterName The name of the conversation (the display name of the recipient for ONE_TO_ONE conversation or the room name for a ROOM conversation)
         * @readonly
         */
        this.filterName = "";

        /**
         * @public
         * @property {number} missedCounter The number of instant messages not read
         * @readonly
         */
        this.missedCounter = 0;

        /**
         * @public
         * @property {number} missedCalls (ONE_TO_ONE conversation only) The number of call missed with this recipient (only WebRTC call)
         * @readonly
         */
        this.missedCalls = 0;

        /**
         * @public
         * @property {Message[]} messages The list of messages downloaded for this conversation
         * @link Message
         * @readonly
         */
        this._messages = [];

        /**
         * @private
         * @readonly
         */
        this.participantStatuses = {};

        /**
         * @private
         * @readonly
         */
        this.draft = "";

        /**
         * @private
         * @readonly
         */
        this.uploadFile = null;

        /**
         * @public
         * @property {ConversationStatus} status The status of the conversation
         * @readonly
         */
        this.status = Conversation.Status.ACTIVE;

        // History stuff
        /**
         * @private
         * @readonly
         */
        this.historyIndex = -1;

        /**
         * @private
         * @readonly
         */
        this.historyMessages = [];

        /**
         * @private
         * @readonly
         */
        this.historyDefered = null;

        /**
         * @public
         * @property {Boolean} True if the history has been completely loaded
         * @readonly
         */
        this.historyComplete = false;

        // LastModification
        /**
         * @public
         * @property {Date} lastModification The date of the last modification of the conversation
         * @readonly
         */
        this.lastModification = undefined;

        // CreationDate
        /**
         * @public
         * @property {Date} creationDate The date of the creation of the conversation
         * @since 1.21
         * @readonly
         */
        this.creationDate = new Date();

        // LastMessageText
        /**
         * @public
         * @property {string} lastMessageText The text of the last message received of the conversation
         * @readonly
         */
        this.lastMessageText = "";

        // LastMessageSenderID
        /**
         * @public
         * @property {string} lastMessageSender The ID of the user for the last message
         * @readonly
         */
        this.lastMessageSender = "";

        // Picture in picture
        /**
         * @private
         * @readonly
         */
        this.pip = true;

        // Call references
        /**
         * @public
         * @property {Call} videoCall Link to a WebRTC call (audio/video/sharing) if exists
         * @readonly
         */
        this.videoCall = {
            status: Call.Status.UNKNOWN
        };

        /**
         * @public
         * @property {Call} audioCall Link to a telephony call (from a PBX) if exists
         * @readonly
         */
        this.audioCall = null;

        /**
         * @public
         * @property {ConferenceSession} pstnConferenceSession Link to a pstn conference session if exists
         * @readonly
         * @since 1.30
         */
        this.pstnConferenceSession = null;

        /**
         * @public
         * @property {ConferenceSession} webConferenceSession Link to a webrtc conference session if exists
         * @readonly
         * @since 1.30
         */
        this.webConferenceSession = null;

        //is muted
        /**
         * @private
         * @readonly
         */
        this.isMutedAudio = false;

        /**
         * @private
         * @readonly
         */
        this.isMutedVideo = false;

        /**
         * @private
         * @readonly
         */
        this.infoVisible = null;

        //is conversation muted
        this.muted = false;

        this.pendingPromise = undefined;
        
        //message ID
        let randomBase = this.generateRandomID();
        let messageId = 0;

        this.logger.log("debug", LOG_ID + "(Conversation) constructed : ", this.id);

    }

    /**
     * @private
     * @method addMessage
     * @memberof Conversation
     * @instance
     */
    addOrUpdateMessage(message) {
        let that = this;
        let messageObj = undefined ;

        this.logger.log("debug", LOG_ID + "(addOrUpdateMessage) id : ", this.id, ", message : ", message?message.id:undefined);
        
        // Check if this message already exist in message store
        let messageIndice = that.messages.findIndex(function(item, index, tab) {
            return item.id === message.id
        });
        if (messageIndice != -1) {
            // update the already existing message and return this new value.
            that.updateMessages(messageIndice, message);
            messageObj = that.messages[messageIndice];
        } else {
            // Store the message
            that.messages.push(message);
            messageObj = message;
        }

        // Update lastModification
        that.lastModification = new Date();

        // Update lastMessageText
        that.lastMessageText = message.content;

        //update last activity date for rooms when we receive/sent messages
        if (this.bubble) {
            // dev-code-console //
            //console.log("conversation bubble : ", this.bubble);
            this.logger.log("internal", LOG_ID + "(addOrUpdateMessage) id : ", this.id, ", bubble : ", this.bubble.id);
            // end-dev-code-console //
            this.bubble.lastActivityDate = this.lastModification;
        }

        return messageObj;
    }

    /*************************************************************/
    /* STATIC FACTORIES                                          */
    /*************************************************************/
    static createOneToOneConversation(participant, logger : Logger) {
        // Create the conversation object
        let conversation = new Conversation(participant.jid_im, logger);

        // Attach it to contact
        conversation.contact = participant;
        participant.conversation = conversation;

        // Fill display information
        if (participant.isBot) {
            conversation.avatar = "";
            conversation.type = Conversation.Type.BOT;
        } else {
            conversation.avatar = participant.avatar ?
                participant.avatar.src :
                null;
            conversation.type = Conversation.Type.ONE_TO_ONE;
        }

        conversation.name = participant.name;
        // TODO ? conversation.filterName =
        // utilService.removeDiacritis(participant.displayName.toLowerCase());

        return conversation;
    }

    static createBubbleConversation(bubble, logger: Logger) {
        // Create the conversation object
        let conversation = new Conversation(bubble.jid, logger);
        conversation.type = Conversation.Type.ROOM;
        conversation.bubble = bubble;
        // TODO ? conversation.filterName =
        // utilService.removeDiacritis(room.name.toLowerCase());

        return conversation;
    }

    generateRandomID() {
        return uuid4();
    }

    static getUniqueMessageId() {
        let messageToSendID = "node_" + this.randomBase + this.messageId;
        this.messageId = this.messageId + 1;
        return messageToSendID;
    }

    /*************************************************************/
    /* PUBLIC STATIC METHODS                                     */
    /*************************************************************/
    static stringToStatus(status) {
        switch (status) {
            case "composing":
                return Conversation.Status.COMPOSING;
            case "paused":
                return Conversation.Status.PAUSED;
            default:
                return Conversation.Status.ACTIVE;
        }
    }

    /*************************************************************/
    /* PUBLIC METHODS                                            */
    /*************************************************************/
    reset() {
        this.logger.log("debug", LOG_ID + "(reset) id : ", this.id);
        this.messages = [];
        this.lastMessageText = null;
        this.resetHistory();
    }

    resetHistory() {
        this.logger.log("debug", LOG_ID + "(resetHistory) id : ", this.id);
        //this.messages = [];
        //this.lastMessageText = null;
        this.historyIndex = -1;
        this.historyMessages = [];
        this.historyComplete = false;
        this.currentHistoryId = null;
    }


    getMessageById(messId) {
        return this
            ._messages
            .find((item) => {
                return item.id === messId;
            });
    }

    getlastEditableMsg() {
        let messgs = this._messages.filter((mess) => {
            return (mess.side === Message.Side.RIGHT) ;
        });
        
        messgs.sort((a, b) => {
            let dateElmt1 = new Date(a.date);
            let dateElmt2 = new Date(b.date);
            return dateElmt2.getTime() - dateElmt1.getTime();
        });
        
        return messgs[0];
        // return this.messages.slice(-1)[0];
    }
}

/**
 * Enum conversation type
 * @public
 * @enum {number}
 * @readonly
 */
Conversation.Type = {
    /** One-to-one conversation */
    ONE_TO_ONE: 0,
    /** Room conversation with multiple participants */
    ROOM: 1,
    /** Conversation with a Bot */
    BOT: 2
};

/**
 * Enum conversation status
 * @public
 * @enum {Object}
 * @readonly
 */
Conversation.Status = {
    /** Active conversation */
    ACTIVE: {
        key: 0,
        value: "active"
    },
    /** Inactive conversation */
    INACTIVE: {
        key: 1,
        value: "inactive"
    },
    /** When composing a message */
    COMPOSING: {
        key: 2,
        value: "composing"
    },
    /** When a message is written but not sent */
    PAUSED: {
        key: 3,
        value: "paused"
    }
};

// module.exports.Conversation = Conversation;
export {Conversation};
