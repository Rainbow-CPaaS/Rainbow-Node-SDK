"use strict";

/**
 * @class
 * @name Message
 * @description
 *      This class is used to represent a message in a conversation <br/>
 *      A message is exchanged when discussing in One-to-One or in a Bubble.
 */
class Message {

    constructor() {

        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Message
         * @instance
         */
        this.id = "581b40a9383b2852d37aa099";

        /**
         * @public
         * @readonly
         * @property {string} fromJid The JID (without the resource) of the user who sent this Message. Can be the identity of a user or a user inside a Bubble
         * @instance
         */
        this.fromJid = "";

        /**
         * @public
         * @readonly
         * @property {string} resource The resource of the user who sent this message
         * @instance
         */
        this.resource = "";

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
        this.type = "chat";

        /**
         * @public
         * @readonly
         * @property {string} content The content of this message (text)
         * @instance
         */
        this.content = "";

        /**
         * @public
         * @readonly
         * @property {string} lang The language of the content for this  Message (if specified)
         * @instance
         */
        this.lang = "";

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
         * @readonly
         * @property {string} subject The subject of the message (if provided)
         * @instance
         */
        this.subject = "";

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
        var message = $filter("emojiUnicodeToShort")(data);
        return new Message(id, Message.Type.FS, date, from, side, message, status, fileId);
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createConferenceMessage(id, date, from, side, status, conferenceDescriptor) {
        var room = roomService.getRoomByJid(conferenceDescriptor.roomjid);
        var headerConferenceMessage = "";
        switch (conferenceDescriptor.type) {
            case "invite":
                headerConferenceMessage = $filter("translate")("headerConferenceMessage", {
                    sender: from._displayName,
                    firstname: from.firstname,
                    bubblename: room.name
                });
                break;
            case "reminder":
                if (room && room.owner) {
                    headerConferenceMessage = $filter("translate")("conferenceReminderMessageforOwner", {sender: from._displayName});
                } else {
                    headerConferenceMessage = $filter("translate")("conferenceReminderMessage", {sender: from._displayName});
                }
                break;
            default:
                headerConferenceMessage = $filter("translate")("headerConferenceMessage", {
                    sender: from._displayName,
                    firstname: from.firstname,
                    bubblename: room.name
                });
                break;
        }
        if (room.desc) {
            headerConferenceMessage += "<br>" + $filter("translate")("conferenceSuject") + room.desc;
        }
        var message = headerConferenceMessage;
        return new Message(id, Message.Type.CHAT, date, from, side, message, status);
    }

    /**
     * @private
     * @method
     * @instance
     */
    static createFileMessage(id, date, from, side, data, status) {
        return new Message(id, Message.Type.FILE, date, from, side, data, status);
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
    /** A file transfert message */
    FT: {
        key: 3,
        value: "FileTransfer"
    },
    /** A WebRTC message */
    WEBRTC: {
        key: 4,
        value: "WebRTC CAll"
    },
    /** A Recording message */
    RECORDING: {
        key: 5,
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