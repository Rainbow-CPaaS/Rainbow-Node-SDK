"use strict";

export {};

/**
 * @class
 * @name AlertMessage
 * @public
 * @description
 *      This class represents an Alert Message received from server on an Alert Device. <br>
 */
class AlertMessage
{
    public id : string;
    public toJid : string;
    public fromJid : string;
    public fromResource : string;
    public identifier : string;
    public sender : string;
    public sent : string;
    public status : string;
    public msgType : string;
    public references : string;
    public scope : string;
    public info : AlertMessageInfo;

    constructor( id? : string, toJid? : string, fromJid? : string, fromResource? : string, identifier? : string, sender? : string, sent? : string, status? : string, msgType? : string, references? : string, scope? : string,  info? : AlertMessageInfo) {
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the AlertMessage
         * @instance
         */
        this.id = id;

        /**
         * @public
         * @readonly
         * @property {string} toJid The JID of the recipient of this alert message
         * @instance
         */
        this.toJid = toJid;

        /**
         * @public
         * @readonly
         * @property {string} fromJid The JID (without the resource) of the user who sent this alert message.
         * @instance
         */
        this.fromJid = fromJid;

        /**
         * @public
         * @readonly
         * @property {string} fromResource The resource of the user who sent this message
         * @instance
         */
        this.fromResource = fromResource;

        /**
         * @public
         * @readonly
         * @property {string} identifier The Identifier of the alert message (alertId). It's the one to use in <see cref="T:Alerts.SendAlertFeedback(string, string, Action{SdkResult{bool}})"/>
         * @instance
         */
        this.identifier = identifier;

        /**
         * @public
         * @readonly
         * @property {string} sender The Sender of the alert message
         * @instance
         */
        this.sender = sender;

        /**
         * @public
         * @readonly
         * @property {string} sent The Date time when sent
         * @instance
         */
        this.sent = sent;

        /**
         * @public
         * @readonly
         * @property {string} status The Status ("Actual" or "Test")
         * @instance
         */
        this.status = status;

        /**
         * @public
         * @readonly
         * @property {string} msgType The Msg Type ("Alert", "Cancel", "Update")
         * @instance
         */
        this.msgType = msgType;

        /**
         * @public
         * @readonly
         * @property {string} references The The group listing identifying earlier message(s) referenced by the alert message. The extended message identifier(s) (in the form "sender,identifier,sent")
         * @instance
         */
        this.references = references;

        /**
         * @public
         * @readonly
         * @property {string} id The scope of the AlertMessage
         * @instance
         */
        this.scope = scope;

        /**
         * @public
         * @readonly
         * @property {AlertMessageInfo} info The Info of the AlertMessage
         * @instance
         */
        this.info = info;

    }
}

/**
 * @class
 * @name AlertMessageInfo
 * @description
 *      This class represents an  Alert Message Info object describing an Alert message sent or received. <br>
 *      <br>
 *          Cf: CAP V1.2 - http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html . <br>
 */
class AlertMessageInfo
{
    public category : string;
    public event : string;
    public urgency : string;
    public certainty : string;
    public expires : string;
    public senderName : string;
    public headline : string;
    public description : string;
    public descriptionMimeType : string;
    public instruction : string;
    public contact : string;

    constructor(category? : string, event? : string, urgency? : string, certainty? : string, expires? : string, senderName? : string, headline? : string, description? : string, descriptionMimeType? : string, instruction? : string, contact? : string) {
        /**
         * @public
         * @readonly
         * @property {string} id The Category of the AlertMessageInfo
         * @instance
         */
        this.category = category;

        /**
         * @public
         * @readonly
         * @property {string} event The Event of the AlertMessageInfo
         * @instance
         */
        this.event = event;

        /**
         * @public
         * @readonly
         * @property {string} urgency The Urgency of the AlertMessageInfo
         * @instance
         */
        this.urgency = urgency;

        /**
         * @public
         * @readonly
         * @property {string} certainty The Certainty of the AlertMessageInfo
         * @instance
         */
        this.certainty = certainty;

        /**
         * @public
         * @readonly
         * @property {string} expires The Expires of the AlertMessageAlertMessageInfo
         * @instance
         */
        this.expires = expires;

        /**
         * @public
         * @readonly
         * @property {string} senderName The SenderName of the AlertMessageInfo
         * @instance
         */
        this.senderName = senderName;

        /**
         * @public
         * @readonly
         * @property {string} headline The Headline of the AlertMessageInfo
         * @instance
         */
        this.headline = headline;

        /**
         * @public
         * @readonly
         * @property {string} description The Description of the AlertMessageInfo
         * @instance
         */
        this.description = description;

        /**
         * @public
         * @readonly
         * @property {string} descriptionMimeType The Description Mime Type of the AlertMessageInfo
         * @instance
         */
        this.descriptionMimeType = descriptionMimeType;

        /**
         * @public
         * @readonly
         * @property {string} instruction The Instruction of the AlertMessageInfo
         * @instance
         */
        this.instruction = instruction;

        /**
         * @public
         * @readonly
         * @property {string} contact The Contact of the AlertMessageInfo
         * @instance
         */
        this.contact = contact;

    }
}

module.exports = {AlertMessage, AlertMessageInfo};
export {AlertMessage, AlertMessageInfo};
