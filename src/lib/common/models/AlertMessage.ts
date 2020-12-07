"use strict";

export {};

class AlertMessage
{

    /// <summary>
    /// <see cref="string"/> - Xmpp Id of the alert message
    /// </summary>
    public id : string;

    /// <summary>
    /// <see cref="string"/> - The JID of the recipient of this alert message
    /// </summary>
    public toJid : string;

    /// <summary>
    /// <see cref="string"/> - The JID (without the resource) of the user who sent this alert message.
    /// </summary>
    public fromJid : string;

    /// <summary>
    /// <see cref="string"/> - The resource of the user who sent this message
    /// </summary>
    public fromResource : string;

    /// <summary>
    /// <see cref="string"/> - Identifier of the alert message (alertId). It's the one to use in <see cref="T:Alerts.SendAlertFeedback(string, string, Action{SdkResult{bool}})"/>
    /// </summary>
    public identifier : string;

    /// <summary>
    /// <see cref="string"/> - Sender of the alert message
    /// </summary>
    public sender : string;

    /// <summary>
    /// <see cref="DateTime"/> - Date time when sent
    /// </summary>
    public sent : string;

    /// <summary>
    /// <see cref="String"/> - Status ("Actual" or "Test")
    /// </summary>
    public status : string;

    /// <summary>
    /// <see cref="String"/> - Msg Type ("Alert", "Cancel", "Update")
    /// </summary>
    public msgType : string;

    /// <summary>
    /// <see cref="String"/> - The group listing identifying earlier message(s) referenced by the alert message. The extended message identifier(s) (in the form "sender,identifier,sent")
    /// </summary>
    public references : string;

    /// <summary>
    /// <see cref="String"/> - scope
    /// </summary>
    public scope : string;

    /// <summary>
    /// <see cref="AlertMessageInfo"/> - Info
    /// </summary>
    public  info : AlertMessageInfo;
}

/// <summary>
/// Alert Message Info object describing an Alert message sent or received
///
/// Cf: CAP V1.2 - http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2-os.html
/// </summary>
class AlertMessageInfo
{

    /// <summary>
    /// <see cref="string"/> - Category
    /// </summary>
    public category : string;

    /// <summary>
    /// <see cref="string"/> - Event
    /// </summary>
    public event : string;

    /// <summary>
    /// <see cref="string"/> - Urgency
    /// </summary>
    public urgency : string;

    /// <summary>
    /// <see cref="string"/> - Certainty
    /// </summary>
    public certainty : string;

    /// <summary>
    /// <see cref="DateTime"/> - Expires
    /// </summary>
    public expires : string;

    /// <summary>
    /// <see cref="string"/> - SenderName
    /// </summary>
    public senderName : string;

    /// <summary>
    /// <see cref="string"/> - Headline
    /// </summary>
    public headline : string;

    /// <summary>
    /// <see cref="string"/> - Description
    /// </summary>
    public description : string;

    /// <summary>
    /// <see cref="string"/> - Description Mime Type
    /// </summary>
    public descriptionMimeType : string;

    /// <summary>
    /// <see cref="string"/> - Instruction
    /// </summary>
    public instruction : string;

    /// <summary>
    /// <see cref="string"/> - Contact
    /// </summary>
    public contact : string;
}

module.exports = {AlertMessage, AlertMessageInfo};
export {AlertMessage, AlertMessageInfo};
