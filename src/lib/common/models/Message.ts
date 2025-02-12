"use strict";
import {GeoLoc} from "./GeoLoc";
import {stringify} from "querystring";
import {xu} from "../XMPPUtils";
import {Conversation} from "./Conversation";
import {isDefined} from "../Utils.js";

export {};


/**
 * @class
 * @name Message
 * @public
 * @description
 *      This class is used to represent a message in a conversation <br>
 *      A message is exchanged when discussing in One-to-One or in a Bubble.
 */
class Message {


    /**
     *  The Type of message.
     * @public
     * @enum {{ key: number, value: string }}
     * @readonly
     */
    public static Type: any = {
        /** A chat message */
        CHAT: { key: 0, value: "Chat" },
        /** A file message */
        FILE: { key: 1, value: "File" },
        /** A file message */
        FS: { key: 2, value: "FileSharing" },
        /** A WebRTC message */
        WEBRTC: { key: 4, value: "WebRTC CAll" },
        /** A Recording message */
        RECORDING: { key: 5, value: "Recording" },
        /** A Form message */
        FORM: { key: 6, value: "FORM" }
    };

    /**
     * The Status of the Receipt.
     * @public
     * @enum {number}
     * @readonly
     */
    public static ReceiptStatus = {
        /** No receipt received yet */
        NONE: 0,
        /** No receipt received after a while (The server doesn't answer) */
        ERROR: 1,
        /** Receipt in progress */
        IN_PROGRESS: 2,
        /** The server has confirmed the reception of the message */
        SENT: 3,
        /** The message has been received but not read */
        UNREAD: 4,
        /** The message has been read */
        READ: 5
    };

    /**
     * @private
     */
    public static ReceiptStatusText = ["close", "info", "calllog", "check", "done", "read"];

    /**
     * The Side of Message's from
     * @public
     * @enum {string}
     * @readonly
     */
    public static Side = {
        /** Message is from a recipient */
        LEFT: "L",
        /** Message is from me */
        RIGHT: "R",
        /** Specific admin message */
        ADMIN: "ADMIN"
    };

    public serverAckTimer: any;
    private index: any;
    public id: string;
    public type: any;
    public date: Date;
    public from: any;
    public side: string;
    //public data: string;
    public status: string;
    public receiptStatus: number;
    public fileId: string;
    public fileName: string;
    public isMarkdown: boolean;
    public subject: string;
    public geoloc: GeoLoc;
    public voiceMessage: any;
    public alternativeContent: any;
    public attention: any;
    public mentions: any;
    public urgency: string;
    public urgencyAck: boolean = false;
    public urgencyHandler: any = null;
    //public translatedText: string = null;

    // private rxSubject: Subject<any>;
    //public isMerged: boolean;

    public historyIndex: string = null;
    //public showCorrectedMessages: boolean;
    //public replaceMsgs: any[];
    public fileErrorMsg: string = null;

    // Message Attachment Part
    public attachedMsgId: string = null;
    public attachIndex: number;
    public attachNumber: number;


    public fromJid: any;
    public resource: any;
    public toJid: any;
    public content: any;
    public lang: any;
    public cc: any;
    public cctype: any;
    public isEvent: any;
    public event: any;
    public oob: {
        url: string,
        mime: string,
        filename: string,
        filesize: string
    };
    public fromBubbleJid: any;
    public fromBubbleUserJid: any;

    public answeredMsgId: string;
    public answeredMsg: Message;

    public answeredMsgDate: string;
    public answeredMsgStamp: string;
    fileTransfer: any;

    public eventJid: string;
    public originalMessageReplaced: Message;
    public confOwnerId: string;
    public confOwnerDisplayName: string;
    public confOwnerJid: string;
    public conversation: Conversation;
    public isForwarded : boolean;
    public forwardedMsg : any;
    public replacedByMessage: Message;
    public deleted : boolean;
    public modified : boolean;
    public rainbowCpaas : any;


    constructor(serverAckTimer: any, 
                index: any, 
                id: string, 
                type: any, 
                date: Date, 
                from: any, 
                side: string, 
              //  data: string, 
                status: string, 
                receiptStatus: number, 
                // fileId: string, 
                // fileName: string, 
                isMarkdown: boolean, 
                subject: string,
                geoloc: GeoLoc, 
                voiceMessage: any, 
                alternativeContent: any, 
                attention: any,
                mentions: any, 
                urgency: string, 
                urgencyAck: boolean = false, 
                urgencyHandler: any = null, 
                /* translatedText: string = null, */ 
                // isMerged: boolean, 
                historyIndex: string = null, 
                //showCorrectedMessages: boolean, 
                //replaceMsgs: any[], 
                // fileErrorMsg: string = null, 
                attachedMsgId: string = null, 
                attachIndex: number, 
                attachNumber: number, 
                // fromJid: any, 
                resource: any, 
                toJid: any, 
                content: any, 
                lang: any, 
                cc: any,
                cctype: any, 
                isEvent: any, 
                event: any, 
                oob: {
                    url: string,
                    mime: string,
                    filename: string,
                    filesize: string
                }, 
                fromBubbleJid: any,
                fromBubbleUserJid: any,
                answeredMsg: Message,
                answeredMsgId: string,
                answeredMsgDate: string,
                answeredMsgStamp: string,
                // fileTransfer: any,     
                eventJid: string, 
                originalMessageReplaced: Message, 
                confOwnerId: string, 
                confOwnerDisplayName: string, 
                confOwnerJid: string,
                isForwarded:boolean,
                forwardedMsg: any,
                deleted:boolean = false,
                modified : boolean = false,
                rainbowCpaas: any = null) {
        
        /**
         * @private
         * @readonly
         */
        this.serverAckTimer = null;

        /**
         * @private
         * @readonly
         */
        this.index = index;

        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Message
         * @instance
         */
        this.id = id;

        // Answer message.
        /**
         * @public
         * @property {string} answeredMsg The answered message of the message answered
         * @readonly
         */
        this.answeredMsg = answeredMsg;
        /**
         * @public
         * @property {string} answeredMsgId The Id of the message answered
         * @readonly
         */
        this.answeredMsgId = answeredMsgId;
        /**
         * @public
         * @property {string} answeredMsgDate The Date of the message answered
         * @readonly
         */
        this.answeredMsgDate = answeredMsgDate;
        /**
         * @public
         * @property {string} answeredMsgStamp The Stamp of the message answered
         * @readonly
         */
        this.answeredMsgStamp = answeredMsgStamp;

        /**
         * @public
         * @readonly
         * @property {string} fromJid The JID (without the resource) of the user who sent this Message. Can be the identity of a user or a user inside a Bubble
         * @instance
         */
        this.fromJid = from && from.jid_im;
        this.from = from;

        /**
         * @public
         * @property {Side} side The message originator Message.Side.RIGHT is the bot and Message.Side.LT is other side.
         * @instance
         * @readonly
         */
        this.side = side;

        /**
         * @public
         * @readonly
         * @property {string} resource The resource of the user who sent this message
         * @instance
         */
        this.resource = "";

        /**
         * @public
         * @property {Date} date The creation date of the message
         * @instance
         * @readonly
         */
        this.date = date;

        /**
         * @public
         * @readonly
         * @property {string} toJid The JID of the recipient of this message
         * @instance
         */
        this.toJid = "";

        /**
         * @public
         * @readonly
         * @property {string} type The type of the message. Can be `chat` or `groupchat`
         * @instance
         */
        this.type = type;

        /**
         * @public
         * @readonly
         * @property {string} content The content of this message (text)
         * @instance
         */
        this.content = content;

        /**
         * @private
         * @instance
         * @readonly
         */
        this.status = status;

        /**
         * @public
         * @property {ReceiptStatus} receiptStatus The state of the receipt
         * @instance
         * @readonly
         */
        this.receiptStatus = Message.ReceiptStatus.NONE;

        /**
         * @public
         * @readonly
         * @property {string} lang The language of the content for this  Message (if specified)
         * @instance
         */
        this.lang = "";

        /**
         * @public
         * @property {string} fileId An attached file Id (if exists)
         * @instance
         * @readonly
         */
        //this.fileId = fileId;

        /**
         * @public
         * @readonly
         * @property {Boolean} cc True if the message is a carbon-copy (duplicated message due to several resources used)
         * @instance
         */
        this.cc = false;

        /**
         * @public
         * @readonly
         * @property {string} cctype The Carbon-copy type. Can be `sent` or `received`
         * @instance
         */
        this.cctype = "sent";

        /**
         * @public
         * @readonly
         * @property {Boolean} isEvent True if the message is an event (a specific admin message in Bubble - should not be considered as text message)
         * @instance
         */
        this.isEvent = isDefined(isEvent)?isEvent:false;

        /**
         * @public
         * @readonly
         * @property {string} event Contains the name of the event (only filled if isEvent=true)
         * @instance
         */
        this.event = event?event:"";

        /**
         * @public
         * @readonly
         * @property {Object[]} alternativeContent The list of alternative contents
         * @property {String} alternativeContent.message The alternative message content
         * @property {String} alternativeContent.type The alternative message content-type
         * @instance
         */
        this.alternativeContent = alternativeContent;

        /**
         * @public
         * @property {boolean} isMarkdown If the message is a markdown type message
         * @readonly
         */
        this.isMarkdown = isMarkdown;

        /**
         * @public
         * @readonly
         * @property {string} subject The subject of the message (if provided)
         * @instance
         */
        this.subject = subject;

        /**
         * @public
         * @readonly
         * @property {Object} oob The description of an attached file to the message (if provided)
         * @property {String} oob.url The file URL
         * @property {String} oob.mime The file mime-type
         * @property {String} oob.filename The file name
         * @property {Number} oob.filesize The file size
         * @instance
         */
        this.oob = oob?oob:null;

        /**
         * @public
         * @readonly
         * @property {string} fromBubbleJid The JID of the bubble that received the message. (Only for `groupchat` message)
         * @instance
         */
        this.fromBubbleJid = "";

        /**
         * @public
         * @readonly
         * @property {string} fromBubbleUserJid The JID of the user who send the message without the JID of the Bubble. (Only for `groupchat` message)
         * @instance
         */
        this.fromBubbleUserJid = null;

        /**
         * @public
         * @property {geoloc} geoloc
         * @readonly
         */
        this.geoloc = geoloc;

        /**
         * @public
         * @property {object} attention Boolean to indicate if the current logged user is mentionned in the message.
         * @readonly
         * @instance
         */
        this.attention = attention;

        /**
         * @public
         * @property {Array<any>} mentions Array of contacts mentionned in the message.
         * @readonly
         * @instance
         */
        this.mentions = mentions;
        
        /**
         * @public
         * @property {any} voiceMessage
         * @readonly
         */
        this.voiceMessage = voiceMessage;

        /**
         * @public
         * @property {string} urgency the urgency of message ('std', 'low', 'middle', 'high')
         * @readonly
         */
        this.urgency = urgency;

        /**
         * @public
         * @property {boolean} urgencyAck give the information that an urgent message has been updated.
         * @readonly
         */
        this.urgencyAck = urgencyAck;

        /**
         * @private
         * @readonly
         */
        this.urgencyHandler = urgencyHandler;

        /**
         * @public
         * @property {string} translatedText the translation of the message.
         * @readonly
         */
        //this.translatedText = translatedText;

        /**
         * used to know if merged cell when it's webrtc or SFU message or ADMIN message
         * @private
         * @readonly
         */
        // this.isMerged = isMerged;

        /**
         * @public
         * @property {Array<any>} historyIndex the historyIndex of the message.
         * @readonly
         */
        this.historyIndex =  historyIndex;

        /**
         * @public
         * @property {boolean} showCorrectedMessages the showCorrectedMessages of the message.
         * @readonly
         */
        //this.showCorrectedMessages = showCorrectedMessages;

        /**
         * @public
         * @property {string} replaceMsgs the replaceMsgs of the message.
         * @readonly
         */
        //this.replaceMsgs = replaceMsgs;

        // Message Attachment Part
        /**
         * @public
         * @property {string} attachedMsgId the attachedMsgId of the message.
         * @readonly
         */
        this.attachedMsgId = attachedMsgId;
        /**
         * @public
         * @property {string} attachIndex the attachIndex of the message.
         * @readonly
         */
        this.attachIndex = attachIndex;
        /**
         * @public
         * @property {string} attachNumber the attachNumber of the message.
         * @readonly
         */
        this.attachNumber = attachNumber;

        /**
         * @public
         * @property {string} eventJid the eventJid of the message.
         * @readonly
         */
        this.eventJid = eventJid;
        
        /**
         * @public
         * @property {Message} originalMessageReplaced the originalMessageReplaced of the message.
         * @readonly
         */
        this.originalMessageReplaced = originalMessageReplaced;
        
        /**
         * @public
         * @property {string} confOwnerId the confOwnerId of the message.
         * @readonly
         */
        this.confOwnerId = confOwnerId;
        /**
         * @public
         * @property {string} confOwnerDisplayName the confOwnerDisplayName of the message.
         * @readonly
         */
        this.confOwnerDisplayName = confOwnerDisplayName;
        /**
         * @public
         * @property {string} confOwnerJid the confOwnerJid of the message.
         * @readonly
         */
        this.confOwnerJid = confOwnerJid;

        /**
         * @public
         * @readonly
         * @property {Conversation} conversation The Conversation the message belongs to (if provided)
         */
        this.conversation = undefined;

        /**
         * @public
         * @property {boolean} isForwarded the message has been forwarded.
         * @readonly
         */
        this.isForwarded = isForwarded;

        /**
         * @public
         * @property {any} forwardedMsg original message that has been forwarded.
         * @readonly
         */
        this.forwardedMsg = forwardedMsg;

        /**
         * @public
         * @property {Message} replacedBuMessage original message has been replaced by the spotted Message..
         * @readonly
         */
        this.replacedByMessage = null;

        /**
         * @public
         * @property {boolean} deleted the message has been deleted.
         * @readonly
         */
        this.deleted = deleted;

        /**
         * @public
         * @property {boolean} modified the message has been modified.
         * @readonly
         */
        this.modified = modified;

        /**
         * @public
         * @property {Object} rainbowCpaas the message CPaaS API hidden data.
         * @readonly
         */
        this.rainbowCpaas = rainbowCpaas;

    }

    /**
     * @private
     * @method
     * @instance
     */
    static create(serverAckTimer: any, index: any, id: string, type: any, date: Date, from: any, side: string, /*  data: string ,*/ status: string, receiptStatus: number, /* fileId: string, */ /* fileName: string, */ isMarkdown: boolean, subject: string, geoloc: GeoLoc, voiceMessage: any, alternativeContent: any, attention: any, mentions : any,  urgency: string, urgencyAck: boolean = false, urgencyHandler: any = null,/* translatedText: string = null, */ /* isMerged: boolean, */ historyIndex: string = null, /*showCorrectedMessages: boolean,*//* replaceMsgs: any[],*/ /* fileErrorMsg: string = null, */ attachedMsgId: string = null, attachIndex: number, attachNumber: number, /* fromJid: any, */resource: any, toJid: any, content: any, lang: any, cc: any, cctype: any, isEvent: any, event: any, oob: { url: string, mime: string, filename: string, filesize: string }, fromBubbleJid: any, fromBubbleUserJid: any, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, /* fileTransfer: any,*/ eventJid: string, originalMessageReplaced: Message, confOwnerId: string, confOwnerDisplayName: string, confOwnerJid: string, isForwarded: boolean, forwardedMsg : any, deleted : boolean = false, modified : boolean = false) {
        // convert emojione from unicode to short
        //let message = $filter("emojiUnicodeToShort")(data);
        //const message = data;
        // return new Message(id, Message.Type.CHAT, date, from, side, message, status, null, isMarkdown, subject);
        // constructor(id: string, type: any, date: any, from: any, side: string, data:string , status: string, answeredMsg: Message, answeredMsgId: string, answeredMsgDate: string, answeredMsgStamp: string, fileId?, isMarkdown? : boolean , subject?, attention1 = false, additionalContent: any = null, fileName: string = null, geoloc: GeoLoc = null, alternativeContent: any = null) {
        return Message.MessageFactory()({
            serverAckTimer, 
            index, 
            id, 
            type, 
            date, 
            from, 
            side, 
            /*  data: string ,*/ 
            status,
            receiptStatus,
            /* fileId: string, */
            /* fileName: string, */
            isMarkdown,
            subject,
            geoloc, 
            voiceMessage,
            alternativeContent,
            attention,
            mentions,
            urgency,
            urgencyAck,
            urgencyHandler,
           // translatedText,
            //isMerged,
            historyIndex,
            //showCorrectedMessages,
            //replaceMsgs,
            /* fileErrorMsg: string = null, */ 
            attachedMsgId, 
            attachIndex, 
            attachNumber, 
            /* fromJid: any, */
            resource, 
            toJid,
            content,
            lang,
            cc, 
            cctype,
            isEvent,
            event,
            oob,
            fromBubbleJid, 
            fromBubbleUserJid,
            answeredMsg,
            answeredMsgId,
            answeredMsgDate,
            answeredMsgStamp,
            /* fileTransfer: any,*/
            eventJid,
            originalMessageReplaced,
            confOwnerId,
            confOwnerDisplayName,
            confOwnerJid,
            isForwarded,
            forwardedMsg,
            deleted,
            modified
        });
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createFileSharingMessage(id, date, from, side, data, status, fileId) {
        // convert emojione from unicode to short
        let message = data;
        //return new Message(id, Message.Type.FS, date, from, side, message, status, fileId);
        return Message.MessageFactory()({id, type: Message.Type.FS, date, from, side, data: message, status, fileId});
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createWebRTCMessage(id, date, from, side, data, status) {
        //return new Message(id, Message.Type.WEBRTC, date, from, side, data, status);
        return Message.MessageFactory()({id, type: Message.Type.WEBRTC, date, from, side, data, status});
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createFTMessage(id, date, from, side, data, status, fileTransfer) {
        //let message = new Message(id, Message.Type.FT, date, from, side, data, status);
        let message = Message.MessageFactory()({id, type: Message.Type.FT, date, from, side, data, status});
        message.fileTransfer = fileTransfer;
        return message;
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createBubbleAdminMessage(id, date, from, type, body, subject) {
        let event = type;
        let isEvent = isDefined(event)?true:false;
        let side = Message.Side.ADMIN;
        //let message = Message.create(id, date, from, side, data, false);
        let message = Message.MessageFactory()({id, date, from, side, event, status: false, content:body, subject, isEvent});

        return message;
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createRecordingAdminMessage(id, date, from, type, cmd) {
        let data = type + "Recording";
        if (cmd) {
            data = data + cmd;
        }
        let side = Message.Side.ADMIN;
        //let message = new Message(id, Message.Type.RECORDING, date, from, side, data, false);
        let message = Message.MessageFactory()({
            id,
            type: Message.Type.RECORDING,
            date,
            from,
            side,
            data,
            status: false
        });
        return message;
    }

    /**
     * Method extract fileId part of URL
     *
     * @private
     * @param {string} url
     * @returns {string}
     *
     * @memberof Conversation
     */
    static extractFileIdFromUrl(url) {
        let parts = url.split("/");
        let fileDescriptorId = parts.pop() || parts.pop();
        return fileDescriptorId;
    }

    updateMessage(data) {
        let that = this;
        if (data) {

            let messageproperties = Object.getOwnPropertyNames(that);
            //console.log("updateBubble update Bubble with : ", data["id"]);
            Object.getOwnPropertyNames(data).forEach(
                (val, idx, array) => {
                    //console.log(val + " -> " + data[val]);
                    if (messageproperties.find((el) => {
                        return val == el;
                    })) {
                        //console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Message class : ", val, " -> ", data[val]);
                        that[val] = data[val];
                    } else {
                        // dev-code-console //
                        //console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Message class can not update Message with : ", val, " -> ", data[val]);
                        console.log("WARNING : One property of the parameter of Message::updateMessage method is not present in the Message class can not update Message with : ", val);
                        // end-dev-code-console //
                    }
                });
        }

        return this;
    }

    /**
     * @function
     * @public
     * @name MessageFactory
     * @description
     * This class is used to create a message from data object
     */
    public static MessageFactory() {
        //constructor(id, type, date, from, side, data, status, fileId?, isMarkdown?, subject?) {
        return (data: any): Message => {

            let geoloc = data.geoloc ? GeoLoc.create(data.geoloc.datum, data.geoloc.latitude, data.geoloc.longitude, data.geoloc.altitude) : null;
            let message = new Message(
                    null, 
                    null,  
                    data.id, 
                    data.type, 
                    data.date, 
                    data.from, 
                    data.side, 
                    data.status, 
                    Message.ReceiptStatus.NONE, 
                    data.isMarkdown, 
                    data.subject, 
                    geoloc, 
                    data.voiceMessage, 
                    data.alternativeContent, 
                    data.attention, 
                    data.mentions,
                    data.urgency, 
                    data.urgencyAck, 
                    data.urgencyHandler,
                    //data.translatedText,
                    //data.isMerged,
                    data.historyIndex,
                    //data.showCorrectedMessages, 
                    //data.replaceMsgs,
                    data.attachedMsgId,
                    data.attachIndex,
                    data.attachNumber,
                    // fromJid: any, 
                    data.resource,
                    data.toJid,
                    data.content,
                    data.lang,
                    data.cc,
                    data.cctype,
                    data.isEvent,
                    data.event,
                    data.oob,
                    data.fromBubbleJid,
                    data.fromBubbleUserJid,
                    data.answeredMsg,
                    data.answeredMsgId,
                    data.answeredMsgDate,
                    data.answeredMsgStamp,
                    // fileTransfer: any,     
                    data.eventJid,
                    data.originalMessageReplaced,
                    data.confOwnerId,
                    data.confOwnerDisplayName,
                    data.confOwnerJid,
                    data.isForwarded,
                    data.forwardedMsg,
                    data.deleted,
                    data.modified);
            if (data) {
                let messageproperties = Object.getOwnPropertyNames(message);
                Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        //console.log(val + " -> " + data[val]);
                        if (!messageproperties.find((el) => {
                            return val == el;
                        })) {
                            //console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                            // from become fromJid and data become content
                            if (val != "from" && val != "data") {
                                // dev-code-console //
                                console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Message class : ", val);
                                // end-dev-code-console //
                            }
                        }
                    });
                    // */
                /*
                const propertyNames = Object.getOwnPropertyNames(data);

                for (let idx = 0; idx < propertyNames.length; idx++) {
                    const val = propertyNames[idx];

                    const propertyExists = messageproperties.find((el) => val === el);

                    if (!propertyExists) {
                        if (val !== "from" && val !== "data") {
                            console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Message class : ", val);
                        }
                    }
                }
                // */
            }

            return message;
        };
    }

}
module.exports.Message = Message;
export {Message};
