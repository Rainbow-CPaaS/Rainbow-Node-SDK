"use strict";
import {RESTService} from "../RESTService.js";

export {};


import {XMPPUTils} from "../../common/XMPPUtils.js";

import {Conversation} from "../../common/models/Conversation.js";
import {Channel} from "../../common/models/Channel.js";
import {isNullOrEmpty, logEntryExit} from "../../common/Utils.js";
import {AlertMessage} from "../../common/models/AlertMessage.js";
import {AlertMessageInfo} from "../../common/models/AlertMessage.js";
import {NameSpacesLabels, XMPPService} from "../XMPPService.js";
import {AlertsService} from "../../services/AlertsService.js";
import {Dictionary, IDictionary, KeyValuePair} from "ts-generic-collections-linq";
import {Bubble} from "../../common/models/Bubble.js";
import {GenericHandler} from "./GenericHandler.js";

//const util = require('util');
//const xml = require("@xmpp/xml");

//const prettydata = require("../pretty-data").pd;
import {pd as prettydata} from "../pretty-data.js";

//const AsyncLock = require('async-lock');
import {default as AsyncLock} from 'async-lock';

const LOG_ID = "XMPP/HNDL/ALERTS - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

/*
private void Xmpp_AlertMessageReceived(object sender, Sharp.Xmpp.Im.MessageEventArgs e)
        {
            // Method called only when the message contains a "body"
            log.Debug("[Xmpp_AlertMessageReceived] e.Message.To:[{0}] - e.Message.From:[{1}] - IM Message:[{2}]", e.Message.To, e.Message.From, e.Message.ToString());

            DateTime dateTime;

            AlertMessage alertMessage = new AlertMessage();

            Sharp.Xmpp.Im.Message xmppMessage = e.Message;

            // Set XMPP info related
            alertMessage.Id = e.Message.Id;
            alertMessage.ToJid = e.Message.To?.GetBareJid()?.ToString();
            alertMessage.FromJid = e.Message.From?.GetBareJid().ToString();
            alertMessage.FromResource = e.Message.From?.Resource;

            if (xmppMessage.Data["alert", "http://www.incident.com/cap/1.0"] != null)
            {
                XmlElement alertElm = xmppMessage.Data["alert", "http://www.incident.com/cap/1.0"];
                XmlElement infoElm;

                alertMessage.Identifier = alertElm["identifier"]?.InnerText;
                alertMessage.Sender = alertElm["sender"]?.InnerText;

                if (!DateTime.TryParse(alertElm["sent"]?.InnerText, out dateTime))
                    dateTime = DateTime.MinValue;
                alertMessage.Sent = dateTime.ToUniversalTime();

                alertMessage.Status = alertElm["status"]?.InnerText;
                alertMessage.MsgType = alertElm["msgType"]?.InnerText;
                alertMessage.References = alertElm["references"]?.InnerText;
                alertMessage.Scope = alertElm["scope"]?.InnerText;

                if (alertElm["info"] != null)
                {
                    alertMessage.Info = new AlertMessageInfo();
                    infoElm = alertElm["info"];
                    alertMessage.Info.Category = infoElm["category"]?.InnerText;
                    alertMessage.Info.Event = infoElm["event"]?.InnerText;
                    alertMessage.Info.Urgency = infoElm["urgency"]?.InnerText;
                    alertMessage.Info.Certainty = infoElm["certainty"]?.InnerText;
                    alertMessage.Info.SenderName = infoElm["senderName"]?.InnerText;
                    alertMessage.Info.Contact = infoElm["contact"]?.InnerText;
                    if (!DateTime.TryParse(infoElm["expires"]?.InnerText, out dateTime))
                        dateTime = DateTime.MinValue;
                    alertMessage.Info.Expires = dateTime.ToUniversalTime();
                    alertMessage.Info.Headline = infoElm["headline"]?.InnerText;
                    alertMessage.Info.Instruction = infoElm["instruction"]?.InnerText;
                    alertMessage.Info.Description = infoElm["description"]?.InnerText.Trim();

                    // Need to checkMime Type
                    if (infoElm["resource"] != null)
                    {
                        XmlElement resourceElm = infoElm["resource"];
                        alertMessage.Info.DescriptionMimeType = resourceElm["mimeType"]?.InnerText;
                    }

                    if (String.IsNullOrEmpty(alertMessage.Info.DescriptionMimeType))
                        alertMessage.Info.DescriptionMimeType = "text/plain";
                    else if (alertMessage.Info.DescriptionMimeType.ToLower() == "text/html")
                    {
                        // Need to parse desciption field
                        if ((alertMessage.Info.Description.StartsWith("<![CDATA[", StringComparison.CurrentCultureIgnoreCase))
                            && (alertMessage.Info.Description.EndsWith("]]>", StringComparison.CurrentCultureIgnoreCase)))
                        {
                            string temp = alertMessage.Info.Description.Substring(9);
                            alertMessage.Info.Description = temp.Substring(0, temp.Length - 3);
                        }
                        else
                        {
                            log.Warn("[Xmpp_AlertMessageReceived] Invalid format provided to encapsulate HTML in Description field:[{0}]", alertMessage.Info.Description);
                        }
                    }
                }

                // Check if this alert message must be handled by other party (already cancelled for example)
                Tuple<DateTime, String> alertInfo;
                lock (lockAlertMessagesReceivedPool)
                {
                    // Do we have already received an alert message with same identifier ?
                    if (alertsMessagePoolReceived.ContainsKey(alertMessage.Identifier))
                    {
                        // Get infor from the previous reception
                        alertInfo = alertsMessagePoolReceived[alertMessage.Identifier];
                        if(alertInfo != null)
                        {
                            DateTime previousSent = alertInfo.Item1;    // previous Sent information
                            String previousMsgType = alertInfo.Item2;   // previous MsgType information

                            // Check is this alert has been already Cancelled
                            if (previousMsgType == "Cancel")
                            {
                                log.Info("[Xmpp_AlertMessageReceived] This alert has been already cancelled - we don't take care of this alert message - id:[{0}] - identifier[{1}]", alertMessage.Id, alertMessage.Identifier);
                                return;
                            }
                            // Check is the previous alert is more recent than the current one
                            else if (previousSent > alertMessage.Sent )
                            {
                                log.Info("[Xmpp_AlertMessageReceived] This alert is older than the previous one - we don't take care of this alert message - id:[{0}] - identifier[{1}] - sent[{2}] - previous sent[{3}]", alertMessage.Id, alertMessage.Identifier, alertMessage.Sent.ToString("o"), previousSent.ToString("o"));
                                return;
                            }
                        }
                    }
                }

                // We store Alert Info for future check
                alertInfo = new Tuple<DateTime, string>(alertMessage.Sent, alertMessage.MsgType);

                // It's possible to receive the same Alert several times (if we don't answered it with "read" receipt).
                // So we need to check keys before to add it
                if (alertsMessagePoolReceived.ContainsKey(alertMessage.Identifier))
                    alertsMessagePoolReceived.Remove(alertMessage.Identifier);
                alertsMessagePoolReceived.Add(alertMessage.Identifier, alertInfo);

                // Inform the server that we have received it
                MarkAlertMessageAsReceived(alertMessage.FromJid, alertMessage.Id, null);

                AlertMessageReceived.Raise(this, new AlertMessageEventArgs(alertMessage));

                // Do we need to automatically mark message as read ?
                if (application.Restrictions.SendReadReceipt)
                    MarkAlertMessageAsRead(alertMessage.FromJid, alertMessage.Id, null);
            }
        }

#endregion EVENTS FIRED BY Xmpp OBJECT

#region Internal / Private stuff
        internal Alerts(Application application)
        {
            timerFactor = application.timerFactor;

            this.application = application;
            rest = application.GetRest();
            xmpp = application.GetXmpp();

            alertsMessagePoolReceived = new Dictionary<string, Tuple<DateTime, string>>();
            alertsMessagePoolSent = new Dictionary<string, Tuple<string, string, DateTime>>();

            // XMP Events to manage:
            xmpp.AlertMessageReceived += Xmpp_AlertMessageReceived;

            Random random = new Random();
            DelayToSendReceiptReceived = TimeSpan.FromMilliseconds( random.Next(500, 1000) );
            DelayToSendReceiptRead = DelayToSendReceiptReceived + TimeSpan.FromMilliseconds( random.Next(0, 500) );

            log.Debug("[Alert] DelayToSendReceipt (in ms) - Received:[{0}] - Read:[{1}]", DelayToSendReceiptReceived.TotalMilliseconds, DelayToSendReceiptRead.TotalMilliseconds);
        }

        internal void SetCurrentContactId(string contactId)
        {
            currentContactId = contactId;
        }

        internal void SetCurrentContactJid(string contactJid)
        {
            currentContactJid = contactJid;
        }

        internal void ResetAllCacheList()
        {
            lock (lockAlertMessagesReceivedPool)
                alertsMessagePoolReceived.Clear();

            lock (lockAlertMessagesSentPool)
                alertsMessagePoolSent.Clear();

            log.Debug("[ResetAllCacheList]");
        }

#endregion Internal / Private stuff
    }
// */
@logEntryExit(LOG_ID)
class AlertEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    public alertsService: any;
    private _options: any;
    private _xmpp : XMPPService;
    private alertsMessagePoolReceived: IDictionary<string, KeyValuePair<Date, string>> = new Dictionary();
    private lockEngine: any;
    private lockKey = "LOCK_ALERTS_EVENTS";
    public findAttrs: any;
    public findChildren: any;

    static getClassName(){ return 'NotificationEventHandler'; }
    getClassName(){ return AlertEventHandler.getClassName(); }

    constructor(xmppService : XMPPService, alertsService : AlertsService, options: any) {
        super(xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});

        this.alertsService = alertsService;
        this._options = options;

        this._xmpp = xmppService;

        let that = this;

        this.findAttrs = () => {

        };

        /*
        this.findChildren = (element) => {
            try {
                that.logger.log("debug", LOG_ID + "(findChildren) _entering_");
                that.logger.log("internal", LOG_ID + "(findChildren) _entering_", element);
                that.logger.log("error", LOG_ID + "(findChildren) findChildren element : ", element, " name : ", element.getName());
                let json = {};
                //let result = null;
                let children = element.children;
                if (children.length > 0) {
                    json[element.getName()] = {};
                    let childrenJson = json[element.getName()];
                    children.forEach((elemt) => {
                        // @ts-ignore
                        if (typeof elemt.children === Array) {
                            that.logger.log("error", LOG_ID + "(findChildren)  children.forEach Array : ", element, ", elemt : ", elemt);
                            childrenJson[elemt.getName()] = elemt.children[0];
                        }
                        that.logger.log("error", LOG_ID + "(findChildren)  children.forEach element : ", element, ", elemt : ", elemt);
                        childrenJson[elemt.getName()] = this.findChildren(elemt);
                    });
                    return json;
                } else {
                    that.logger.log("error", LOG_ID + "(findChildren)  No children element : ", element);
                    return element.getText();
                }
                //return result;
            } catch (err) {
                that.logger.log("error", LOG_ID + "(findChildren) CATCH Error !!! : ", err);
            }
        };

         */

    }

    /*
     <message
  xmlns="jabber:client" to="99a5a005caa744c0ba598b1f6ab0d3ad@openrainbow.net/node_Skl4kdoZ" from="alert.openrainbow.net" type="headline" id="ar-5c3df744ddccdd341a960ba9-8970227042734046209-ynGr3k7FQ8A2Y+vFyCCSRTYjMhU=-5fce2eb4e58c590d5b773203/0">
  <request
    xmlns="urn:xmpp:receipts"/>
    <alert
      xmlns="http://www.incident.com/cap/1.0">
      <identifier>5fce2eb4e58c590d5b773203/0</identifier>
      <sender>vincent01@vbe.test.openrainbow.net</sender>
      <sent>2020-12-07T14:31:32+01:00</sent>
      <status>Actual</status>
      <msgType>Alert</msgType>
      <scope>Public</scope>
      <info>
        <category>Safety</category>
        <event>Fire in building</event>
        <urgency>Immediate</urgency>
        <certainty>Observed</certainty>
        <expires>2020-12-08T14:31:32+01:00</expires>
        <senderName>sender name</senderName>
        <headline>headline - headline</headline>
        <description>Fire in the building</description>
        <contact>contact - contact</contact>
        <resource>
          <mimeType>text/html</mimeType>
        </resource>
      </info>
    </alert>
  </message>
     */

    //region Lock

    lock(fn) {
        let that = this;
        let opts = undefined;
        return that.lockEngine.acquire(that.lockKey,
            async function () {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) lock the ", that.lockKey);
                return await fn(); // async work
            }, opts).then((result) => {
            // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
            that.logger.log("internal", LOG_ID + "(lock) release the ", that.lockKey, ", result : ", result);
            return result;
        });
    }

    //endregion

    onManagementMessageReceived (msg, stanza) {
        let that = this;

        try {
            that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let children = stanza.children;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "room":
                        break;
                    case "usersettings":
                        break;
                    case "userinvite":
                        // treated also in conversationEventHandler
                        // treated also in invitationEventHandler
                        break;
                    case "group":
                        break;
                    case "conversation":
                        break;
                    case "mute":
                        break;
                    case "unmute":
                        break;
                    case "file":
                        break;
                    case "thumbnail":
                        break;
                    case "channel-subscription":
                    case "channel":
                        break;
                    case "openinvite":
                        // treated in invitationEventHandler
                        break;
                    case "favorite":
                        // treated in favoriteEventHandler
                        break;
                    case "notification":
                        that.onNotificationManagementMessageReceived(node);
                        break;
                    case "roomscontainer":
                        // treated in conversationEventHandler
                        break;
                    case "webinar":
                        // treated in webinarEventHandler
                        break;
                    case "poll":
                        // treated in conversationEventHandler
                        break;
                    case "connectorcommand":
                        // treated in conversationEventHandler
                        break;
                    case "connectorconfig":
                        // treated in conversationEventHandler
                        break;
                    case "command_ended":
                        // treated in conversationEventHandler
                        break;
                    case "import_status":
                        // treated in conversationEventHandler
                        break;                    
                    case "joincompanyinvite":
                        // treated in invitationEventHandler
                        break;
                    case "joincompanyrequest":
                        // treated in invitationEventHandler
                        break;
                    default:
                        that.logger.log("error", LOG_ID + "(onManagementMessageReceived) unmanaged management message node " + node.getName());
                        break;
                }
            });
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onHeadlineMessageReceived (msg, stanza) {
        let that = this;

        try {
            that.logger.log("internal", LOG_ID + "(onHeadlineMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived) message received");


            //DateTime dateTime;

            let alertMessage : AlertMessage = new AlertMessage();

            //Sharp.Xmpp.Im.Message xmppMessage = e.Message;

            // Set XMPP info related
            alertMessage.id = stanza.attrs.id;
            alertMessage.toJid = stanza.attrs.to;
            alertMessage.fromJid = stanza.attrs.from;
            alertMessage.fromResource = XMPPUTils.getXMPPUtils().getResourceFromFullJID(stanza.attrs.from);

//            if (xmppMessage.Data["alert", "http://www.incident.com/cap/1.0"] != null)
  //          {
                let alertElem = stanza.find("alert");
            if (alertElem && alertElem.length == 1 && alertElem.attrs.xmlns == NameSpacesLabels.IncidentCap) {
                //XmlElement alertElm = xmppMessage.Data["alert", "http://www.incident.com/cap/1.0"];
                //XmlElement infoElm;

                alertMessage.identifier = alertElem.getChild("identifier") ? alertElem.getChild("identifier").getText() || "" : "";
                alertMessage.sender =  alertElem.getChild("sender") ? alertElem.getChild("sender").getText() || "" : ""; //alertElm["sender"]?.InnerText;

                let dateSent =  alertElem.getChild("sent") ? alertElem.getChild("sent").getText() || "" : ""; //alertElm["sent"]?.InnerText;

                //if (!DateTime.TryParse(alertElm["sent"]?.InnerText, out dateTime))
                //dateTime = DateTime.MinValue;
                alertMessage.sent = new Date(dateSent).toUTCString();//dateTime.ToUniversalTime();

                alertMessage.status =  alertElem.getChild("status") ? alertElem.getChild("status").getText() || "" : ""; // alertElm["status"]?.InnerText;
                alertMessage.msgType =  alertElem.getChild("msgType") ? alertElem.getChild("msgType").getText() || "" : ""; // alertElm["msgType"]?.InnerText;
                alertMessage.references =  alertElem.getChild("references") ? alertElem.getChild("references").getText() || "" : ""; // alertElm["references"]?.InnerText;
                alertMessage.scope =  alertElem.getChild("scope") ? alertElem.getChild("scope").getText() || "" : ""; // alertElm["scope"]?.InnerText;

                let alertInfoElm = alertElem.getChild("info");

//                if (alertElm["info"] != null)
                if (alertInfoElm != null)
                {
                    alertMessage.info = new AlertMessageInfo();
                    //infoElm = alertElm["info"];
                    alertMessage.info.category = alertInfoElm.getChild("category") ? alertInfoElm.getChild("category").getText() || "" : ""; // infoElm["category"]?.InnerText;
                    alertMessage.info.event = alertInfoElm.getChild("event") ? alertInfoElm.getChild("event").getText() || "" : ""; // infoElm["event"]?.InnerText;
                    alertMessage.info.urgency = alertInfoElm.getChild("urgency") ? alertInfoElm.getChild("urgency").getText() || "" : ""; // infoElm["urgency"]?.InnerText;
                    alertMessage.info.certainty = alertInfoElm.getChild("certainty") ? alertInfoElm.getChild("certainty").getText() || "" : ""; // infoElm["certainty"]?.InnerText;
                    alertMessage.info.senderName = alertInfoElm.getChild("senderName") ? alertInfoElm.getChild("senderName").getText() || "" : ""; // infoElm["senderName"]?.InnerText;
                    alertMessage.info.contact = alertInfoElm.getChild("contact") ? alertInfoElm.getChild("contact").getText() || "" : ""; // infoElm["contact"]?.InnerText;

                    let dateExpires =  alertInfoElm.getChild("expires") ? alertInfoElm.getChild("expires").getText() || "" : ""; //alertElm["sent"]?.InnerText;
                    alertMessage.info.expires = new Date(dateExpires).toUTCString();//dateTime.ToUniversalTime();

                    //if (!DateTime.TryParse(infoElm["expires"]?.InnerText, out dateTime))
                    ///dateTime = DateTime.MinValue;
                    //alertMessage.info.expires = dateTime.ToUniversalTime();
                    alertMessage.info.headline = alertInfoElm.getChild("headline") ? alertInfoElm.getChild("headline").getText() || "" : ""; // infoElm["headline"]?.InnerText;
                    alertMessage.info.instruction = alertInfoElm.getChild("instruction") ? alertInfoElm.getChild("instruction").getText() || "" : ""; // infoElm["instruction"]?.InnerText;
                    alertMessage.info.description = alertInfoElm.getChild("description") ? alertInfoElm.getChild("description").getText() || "" : ""; // infoElm["description"]?.InnerText.Trim();


                    // Need to checkMime Type
                    let alertInfoResourceElm = alertInfoElm.getChild("resource");

//                if (alertElm["info"] != null)
                    if (alertInfoResourceElm != null)
                    {
                   //                    if (infoElm["resource"] != null)
                    //{
                        //XmlElement resourceElm = infoElm["resource"];
                        alertMessage.info.descriptionMimeType = alertInfoResourceElm.getChild("mimeType") ? alertInfoResourceElm.getChild("mimeType").getText() || "" : ""; //  resourceElm["mimeType"]?.InnerText;
                    }

                    if (isNullOrEmpty(alertMessage.info.descriptionMimeType))
                        alertMessage.info.descriptionMimeType = "text/plain";
                    else if (alertMessage.info.descriptionMimeType.toLowerCase() == "text/html")
                    {
                        // Need to parse description field
                        if ((alertMessage.info.description.indexOf("<![CDATA[", 0) == 0)
                            && (alertMessage.info.description.lastIndexOf("]]>") == (alertMessage.info.description.length - "]]>".length )))
                        {
                            let temp = alertMessage.info.description.substring(9);
                            alertMessage.info.description = temp.substring(0, temp.length - 3);
                        }
                        else
                        {
                            that.logger.log("warn", LOG_ID + "(onHeadlineMessageReceived) Invalid format provided to encapsulate HTML in Description field:[{0}]", alertMessage.info.description);
                        }
                    }
                }


                // Check if this alert message must be handled by other party (already cancelled for example)
                let alertInfo : KeyValuePair<Date, string> ;
                let alreadyTreated = false;
                that.lock(() => {
                    // Do we have already received an alert message with same identifier ?
                    if (that.alertsMessagePoolReceived.containsKey(alertMessage.identifier))
                    {
                        // Get infor from the previous reception
                        alertInfo = that.alertsMessagePoolReceived[alertMessage.identifier];
                        if(alertInfo != null)
                        {
                            let previousSent : Date = alertInfo.key;    // previous Sent information
                            let previousMsgType : string = alertInfo.value;   // previous MsgType information

                            // Check is this alert has been already Cancelled
                            if (previousMsgType == "Cancel")
                            {
                                that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived)  This alert has been already cancelled - we don't take care of this alert message - id:[{0}] - identifier[{1}]", alertMessage.id, alertMessage.identifier);
                                alreadyTreated = true;
                            }
                            // Check is the previous alert is more recent than the current one
                            else if (previousSent > new Date(alertMessage.sent) )
                            {
                                that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived) This alert is older than the previous one - we don't take care of this alert message - id:[{0}] - identifier[{1}] - sent[{2}] - previous sent[{3}]", alertMessage.id, alertMessage.identifier, alertMessage.sent, previousSent);
                                alreadyTreated = true;
                            }
                        }
                    }
                });

                if (alreadyTreated) {
                        return;
                }

                // We store Alert Info for future check
                alertInfo = new KeyValuePair (new Date(alertMessage.sent), alertMessage.msgType) ;

                // It's possible to receive the same Alert several times (if we don't answered it with "read" receipt).
                // So we need to check keys before to add it
                if (that.alertsMessagePoolReceived.containsKey(alertMessage.identifier)) {
                    /* let itToRemove = that.alertsMessagePoolReceived.single((item) => {
                        return item.key == alertMessage.identifier;
                    }); // */
                    that.alertsMessagePoolReceived.remove((item) => {
                        return item.key == alertMessage.identifier;
                    });
                }
                that.alertsMessagePoolReceived.add(alertMessage.identifier, alertInfo);
// */
                // Inform the server that we have received it
                that.alertsService.markAlertMessageAsReceived(alertMessage.fromJid, alertMessage.id);

                // Do we need to automatically mark message as read ?
                if (that._options._getIMOptions().sendReadReceipt) {
                    that.alertsService.markAlertMessageAsRead(alertMessage.fromJid, alertMessage.id);
                }
                // */
                that.logger.log("internal", LOG_ID + "(onHeadlineMessageReceived) alert message received decoded : ", alertMessage);
                //AlertMessageReceived.Raise(this, new AlertMessageEventArgs(alertMessage));
                that.eventEmitter.emit("evt_internal_alertmessagereceived", alertMessage);
            } else {
                that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived) it is not an alert message received.");
                that.logger.log("internal", LOG_ID + "(onHeadlineMessageReceived) it is not an alert message received : ", stanza);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! : ", err);
        }
    }

    onNotificationManagementMessageReceived (stanza) {
        let that = this;

        that.logger.log("internal", LOG_ID + "(onNotificationManagementMessageReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

        try {
            let stanzaElem = stanza;
            let notificationElem = stanzaElem.find("notification");
            if (notificationElem) {
                let fav = {
                    "id": notificationElem.attr("id"),
                    "type": notificationElem.attr("type"),
                    "peerId": notificationElem.attr("peer_id"),
                };
                let action = notificationElem.attr("action");

                if (action === 'create') {
                    that.eventEmitter.emit("evt_internal_notificationcreated_handle", fav);
                }

                if (action === 'delete') {
                    that.eventEmitter.emit("evt_internal_notificationdeleted_handle", fav);
                }
            }
            return true;
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onNotificationManagementMessageReceived) -- failure -- ");
            that.logger.log("internalerror", LOG_ID + "(onNotificationManagementMessageReceived) -- failure -- : ", err.message);
            return true;
        }

        /*

        // */
    };


    onReceiptMessageReceived (msg, stanza) {
    };

    onErrorMessageReceived (msg, stanza) {
        let that = this;

        try {
            if (stanza.getChild('no-store') != undefined){
                // // Treated in conversation handler that.logger.log("error", LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
            } else {
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    };

}

export {AlertEventHandler};
// module.exports.NotificationEventHandler = AlertEventHandler;
