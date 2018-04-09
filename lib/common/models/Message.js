"use strict";

/**
 * @class
 * @name Message
 * @description
 *      This class is used to represent a message in a conversation <br/>
 *      A message is exchanged when discussing in One-to-One or in a Bubble.
 */
class Message {

    constructor(id, type, date, from, side, data, status, fileId, isMarkdown, subject) {

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
        this.fromJid = from;

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
    }

    /**
     * @private
     * @method
     * @instance
     */
    static create(id, date, from, side, data, status, isMarkdown, subject) {
        // convert emojione from unicode to short
        //var message = $filter("emojiUnicodeToShort")(data);
        const message = data;
        return new Message(id, Message.Type.CHAT, date, from, side, message, status, null, isMarkdown, subject);
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createFileSharingMessage(id, date, from, side, data, status, fileId) {
        // convert emojione from unicode to short
        var message = data;
        return new Message(id, Message.Type.FS, date, from, side, message, status, fileId);
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createWebRTCMessage(id, date, from, side, data, status) {
        return new Message(id, Message.Type.WEBRTC, date, from, side, data, status);
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createFTMessage(id, date, from, side, data, status, fileTransfer) {
        var message = new Message(id, Message.Type.FT, date, from, side, data, status);
        message.fileTransfer = fileTransfer;
        return message;
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createBubbleAdminMessage(id, date, from, type) {
        var data = type + "MsgRoom";
        var side = Message.Side.ADMIN;
        var message = Message.create(id, date, from, side, data, false);

        return message;
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createRecordingAdminMessage(id, date, from, type, cmd) {
        var data = type + "Recording";
        if (cmd) {
            data = data + cmd;
        }
        var side = Message.Side.ADMIN;
        var message = new Message(id, Message.Type.RECORDING, date, from, side, data, false);
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


}

/**
 * @public
 * @enum {number}
 * @readonly
 */
Message.Type = {
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
Message.ReceiptStatus = {
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
Message.Side = {
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
Message.ReceiptStatusText = [
    "none",
    "ko",
    "inProgress",
    "sent",
    "received",
    "read"
];

module.exports = Message;