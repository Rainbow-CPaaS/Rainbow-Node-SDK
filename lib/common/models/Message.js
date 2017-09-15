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
         * @property {string} The ID of the Message
         * @instance
         */
        this.id = "581b40a9383b2852d37aa099";

        /**
         * @public
         * @readonly
         * @property {string} The JID (without the resource) of the user who sent this Message. Can be the identity of a user or a user inside a Bubble
         * @instance
         */
        this.fromJid = "";

        /**
         * @public
         * @readonly
         * @property {string} The resource of the user who sent this message
         * @instance
         */
        this.resource = "";

        /**
         * @public
         * @readonly
         * @property {string} The JID of the recipient of this message
         * @instance
         */
        this.toJid = "";

        /**
         * @public
         * @readonly
         * @property {string} The type of the message. Can be `chat` or `groupchat`
         * @instance
         */
        this.type = "chat";

        /**
         * @public
         * @readonly
         * @property {string} The content of this message (text)
         * @instance
         */
        this.content = "";

        /**
         * @public
         * @readonly
         * @property {string} The language of the content for this  Message (if specified)
         * @instance
         */
        this.lang = "";

        /**
         * @public
         * @readonly
         * @property {Boolean} True if the message is a carbon-copy (duplicated message due to several resources used)
         * @instance
         */
        this.cc = false;

        /**
         * @public
         * @readonly
         * @property {string} The Carbon-copy type. Can be `sent` or `received`
         * @instance
         */
        this.cctype = "sent";

        /**
         * @public
         * @readonly
         * @property {Boolean} True if the message is an event (a specific admin message in Bubble - should not be considered as text message)
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
         * @property {Object[]} The list of alternative contents
         * @property {Object.message} The alternative message content
         * @property {Object.type} The alternative message content-type
         * @instance
         */
        this.alternativeContent = null;

        /**
         * @public
         * @readonly
         * @property {string} The subject of the message (if provided)
         * @instance
         */
        this.subject = "";

        /**
         * @public
         * @readonly
         * @property {Object} The description of an attached file to the message (if provided)
         * @property {Object.url} The file URL
         * @property {Object.mime} The file mime-type
         * @property {Object.filename The file name
         * @property {Object.filesize The file size
         * @instance
         */
        this.oob = null;

        /**
         * @public
         * @readonly
         * @property {string} The JID of the bubble that received the message. (Only for `groupchat` message)
         * @instance
         */
        this.fromBubbleJid = "";

        /**
         * @public
         * @readonly
         * @property {string} The JID of the user who send the message without the JID of the Bubble. (Only for `groupchat` message)
         * @instance
         */
        this.fromBubbleUserJid = null;
    }
}

module.exports = Message;