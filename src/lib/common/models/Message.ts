"use strict";
export {};


/**
 * @class
 * @name Message
 * @description
 *      This class is used to represent a message in a conversation <br/>
 *      A message is exchanged when discussing in One-to-One or in a Bubble.
 */
class Message {
    public id: any;
    public fromJid: any;
    public side: any;
    public resource: any;
    public date: any;
    public toJid: any;
    public type: any;
    public content: any;
    public status: any;
    public receiptStatus: any;
    public lang: any;
    public fileId: any;
    public cc: any;
    public cctype: any;
    public isEvent: any;
    public event: any;
    public alternativeContent: any;
    public isMarkdown: any;
    public subject: any;
    public oob: any;
    public fromBubbleJid: any;
    public fromBubbleUserJid: any;
    fileTransfer: any;
    /*static ReceiptStatus: any;
    static Type: any;
    static Side: any;
    static ReceiptStatusText: string[];
    // */

    /**
     * @public
     * @enum {number}
     * @readonly
     */
    static Type :any = {
        /** A chat message */
        CHAT: {
            key: 0,
            value: "Chat"
        },
        /** A file message */
        FILE: {
            key: 1,
            value: "File"
        },
        /** A file message */
        FS: {
            key: 2,
            value: "FileSharing"
        },
        /** A WebRTC message */
        WEBRTC: {
            key: 3,
            value: "WebRTC CAll"
        },
        /** A Recording message */
        RECORDING: {
            key: 4,
            value: "Recording"
        }
    };
    /**
     * @public
     * @enum {number}
     * @readonly
     */
    static ReceiptStatus : any = {
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
     * @public
     * @enum {string}
     * @readonly
     */
    static Side : any = {
        /** Message is from a recipient */
        LEFT: "L",
        /** Message is from me */
        RIGHT: "R",
        /** Specific admin message */
        ADMIN: "ADMIN"
    };
    /**
     * @private
     */
    static ReceiptStatusText : string []= [
        "none",
        "ko",
        "inProgress",
        "sent",
        "received",
        "read"
    ];
    public attention: boolean;

    constructor(id, type, date, from, side, data, status, fileId?, isMarkdown?, subject?, attention1 = false) {

        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Message
         * @instance
         */
        this.id = id;

        /**
         * @public
         * @readonly
         * @property {string} fromJid The JID (without the resource) of the user who sent this Message. Can be the identity of a user or a user inside a Bubble
         * @instance
         */
        this.fromJid = from && from.jid_im;

        /**
         * @public
         * @property {Side} side The message originator
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
        this.content = data;

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
        this.fileId = fileId;

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
        this.isEvent = false;

        /**
         * @public
         * @readonly
         * @property {string} event Contains the name of the event (only filled if isEvent=true)
         * @instance
         */
        this.event = "";

        /**
         * @public
         * @readonly
         * @property {Object[]} alternativeContent The list of alternative contents
         * @property {String} alternativeContent.message The alternative message content
         * @property {String} alternativeContent.type The alternative message content-type
         * @instance
         */
        this.alternativeContent = null;

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
        this.oob = null;

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
         * @property {object} attention Boolean to indicate if the current logged user is mentionned in the message.
         * @readonly
         * @instance
         */
        this.attention = attention1;
    }

    /**
     * @private
     * @method
     * @instance
     */
    static create(id, date, from, side, data, status, isMarkdown?, subject?) {
        // convert emojione from unicode to short
        //let message = $filter("emojiUnicodeToShort")(data);
        const message = data;
        //return new Message(id, Message.Type.CHAT, date, from, side, message, status, null, isMarkdown, subject);
        return Message.MessageFactory()({
            id,
            type: Message.Type.CHAT,
            date,
            from,
            side,
            data: message,
            status,
            fileId: null,
            isMarkdown,
            subject
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
    static createBubbleAdminMessage(id, date, from, type) {
        let data = type + "MsgRoom";
        let side = Message.Side.ADMIN;
        //let message = Message.create(id, date, from, side, data, false);
        let message = Message.MessageFactory()({id, date, from, side, data, status: false});

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

    updateBubble(data) {
        let that = this;
        if (data) {

            let bubbleproperties = Object.getOwnPropertyNames(that);
            //console.log("updateBubble update Bubble with : ", data["id"]);
            Object.getOwnPropertyNames(data).forEach(
                (val, idx, array) => {
                    //console.log(val + " -> " + data[val]);
                    if (bubbleproperties.find((el) => {
                        return val == el;
                    })) {
                        //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                        that[val] = data[val];
                    } else {
                        //console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble with : ", val, " -> ", data[val]);
                        console.log("WARNING : One property of the parameter of BubbleFactory method is not present in the Bubble class can not update Bubble with : ");
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

            let message = new Message(data.id, data.type, data.date, data.from, data.side, data.data, data.status, data.fileId, data.isMarkdown, data.subject, data.attention);
            if (data) {
                let bubbleproperties = Object.getOwnPropertyNames(message);
                Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        //console.log(val + " -> " + data[val]);
                        if (!bubbleproperties.find((el) => {
                            return val == el;
                        })) {
                            //console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Bubble class : ", val, " -> ", data[val]);
                            // from become fromJid and data become content
                            if (val != "from" && val != "data") {
                                console.log("WARNING : One property of the parameter of MessageFactory method is not present in the Message class : ", val);
                            }
                        }
                    });
            }

            return message;
        };
    }

}
module.exports.Message = Message;
export {Message};
