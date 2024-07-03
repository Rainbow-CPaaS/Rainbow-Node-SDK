"use strict";

import {XMPPService} from "../XMPPService";
import {XMPPUTils, xu} from "../../common/XMPPUtils";
import {ConversationEventHandler} from "./conversationEventHandler";

export {};


const moment = require("moment");
const prettydata = require("../pretty-data").pd;

// @ts-ignore
global.window = {};

const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

// @ts-ignore
global.window = undefined;

const xml = require("@xmpp/xml");
import {Message} from "../../common/models/Message";
import {isDefined, logEntryExit} from "../../common/Utils";
import {ConversationsService} from "../../services/ConversationsService";
import {ContactsService} from "../../services/ContactsService";
import {stringify} from "querystring";
import {GenericHandler} from "./GenericHandler";
import {Conversation} from "../../common/models/Conversation.js";

const LOG_ID = "XMPP/HNDL/HIST/CONV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class ConversationHistoryHandler  extends GenericHandler {
        public MESSAGE_MAM: any;
        public FIN_MAM: any;
        public _conversationService: ConversationsService;
        private _contactsService : ContactsService;
    public forceHistoryGetContactFromServer : boolean;
    private _options: any;

    static getClassName(){ return 'ConversationHistoryHandler'; }
    getClassName(){ return ConversationHistoryHandler.getClassName(); }

    static getAccessorName(){ return 'conversationhistory'; }
    getAccessorName(){ return ConversationHistoryHandler.getAccessorName(); }

    constructor(xmppService : XMPPService, conversationService : ConversationsService, contactsService : ContactsService, options : any) {
         super( xmppService);

        this.MESSAGE_MAM = "urn:xmpp:mam:1.result";
        this.FIN_MAM = "urn:xmpp:mam:1.fin";

        this._conversationService = conversationService;
        this._contactsService = contactsService;

        let that = this;

        that._options = options;

        that.forceHistoryGetContactFromServer = that._options.imOptions.forceHistoryGetContactFromServer;
    }

    onMamMessageReceived (msg, stanza) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onMamMessageReceived) _entering_ : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            // Get queryId and deleteId
            let queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
            if (!queryId) {
                if ( stanza.getChild("fin")) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(onMamMessageReceived) no queryid found on result, and a \"fin\" found.");
                    queryId = stanza.getAttr("id");
                } else {
                    queryId = null;
                }
            }

            // jidTel are used for callLog
            if (queryId && queryId.indexOf("tel_") !== 0 && that.onHistoryMessageReceived) {
                that.onHistoryMessageReceived(msg, stanza);
            }

            // jidIm are used for history
            //else if (that.callLogHandler) {
            //    that.callLogHandler(stanza);
            //}

            return true;
        } catch (error) {
            return true;
        }

    }

    async onHistoryMessageReceived (msg, stanza) {
        let that = this;
        // Handle response
        try {
            let conversation : Conversation = null;
            that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) _entering_ : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

            let queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
            if (queryId) {

                // Get associated conversation
                conversation = this._conversationService.getConversationById(queryId);
                if (conversation) {

                    // Extract info
                    let stanzaForwarded = stanza.getChild("result").getChild("forwarded");
                    let stanzaMessage = stanzaForwarded.getChild("message");

                    if (stanzaMessage.getChild("call_log")) {
                        return this.onWebrtcHistoryMessageReceived(stanza, conversation);
                    }

                    let brutJid = stanzaMessage.getAttr("from");

                    // Extract fromJid
                    let fromJid;
                    let roomEvent = null;
                    let bodyEvent = undefined;// <body>Vincent04 Berder04 a rejoint la bulle</body>
                    let subjectEvent = undefined;// <subject>room event</subject>

                    if (brutJid.indexOf("room_") === 0) { fromJid = brutJid.split("/")[1]; }
                    else { fromJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(brutJid); }

                        const eventElmt = stanzaMessage.find("event");
                        if (Array.isArray(eventElmt)) {
                            eventElmt.forEach((content) => {
                                if (!fromJid ) {
                                    roomEvent = content.attr("name") + "";
                                    fromJid = content.attr("jid");

                                    if (roomEvent === "welcome" && conversation.bubble && conversation.bubble.creator) {
                                        let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                                        fromJid = ownerContact ? ownerContact.jid_im : "";
                                    }
                                }

                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - event, roomEvent : ", roomEvent, ", fromJid  : ", fromJid );
                            });
                        } else {
                            // mention['jid'] = eventElmt.text();
                            if (!fromJid ) {
                                roomEvent = eventElmt.attr("name") + "";
                                fromJid = eventElmt.attr("jid");

                                if (roomEvent === "welcome" && conversation.bubble && conversation.bubble.creator) {
                                    let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                                    fromJid = ownerContact ? ownerContact.jid_im : "";
                                }
                            }

                            that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - event, roomEvent : ", roomEvent, ", fromJid  : ", fromJid );
                        }

                    /*
                    if (!fromJid && stanzaMessage.getChild("event")) {
                        roomEvent = stanzaMessage.getChild("event").attr("name") + "";
                        fromJid = stanzaMessage.getChild("event").attr("jid");

                        if (roomEvent === "welcome" && conversation.bubble && conversation.bubble.creator) {
                            let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                            fromJid = ownerContact ? ownerContact.jid_im : "";
                        }
                    }
                    // */

                    if (!fromJid) {
                        that._logger.log(that.WARN, LOG_ID + "(onHistoryMessageReceived) - Receive message without valid fromJid information");
                        return true;
                    }

                    if ( !conversation.pendingPromise ) {
                        conversation.pendingPromise = [];
                    }

                    let promise = new Promise( (resolve) => {
                        that._contactsService.getContactByJid(fromJid, that.forceHistoryGetContactFromServer)
                            .then( (from) => {
                                resolve(from);
                            }).catch( () => {
                            resolve(null);
                        });
                    }).then( async (from : any ) => {
                        let type = stanzaMessage.getAttr("type");
                        let messageId = stanzaMessage.getAttr("id");
                        let date = new Date(stanzaForwarded.getChild("delay").getAttr("stamp"));
                        let body = stanzaMessage.getChild("body").text();
                        let ack = stanzaMessage.getChild("ack");
                        let oobElmt = stanzaMessage.getChild("x", "jabber:x:oob");
                        let conference = stanzaMessage.getChild("x", "jabber:x:audioconference");
                        let content = stanzaMessage.getChild("content", "urn:xmpp:content");
                        let answeredMsg: Message ;
                        let answeredMsgId: string;
                        let answeredMsgDate: string;
                        let answeredMsgStamp: string;
                        let subject : string;
                        let attention: boolean;
                        let urgency : string = "std";
                        let urgencyAck : boolean = false;
                        let urgencyHandler : any = undefined;
                        let attachedMsgId : string;
                        let attachIndex : number;
                        let attachNumber : number;
                        let resource : string;
                        let toJid : string = "";
                        let lang : string = "";                        
                        let event : string = "";
                        let eventJid :string = "";
                        let isEvent : boolean = false;
                        let oob: any;
                        let originalMessageReplaced : any = null;
                        let isForwarded : boolean = false;
                        let forwardedMsg : any;
                        let deletedMsg : boolean;
                        let modifiedMsg : boolean;
                        let mentions : Array<Object> = [];


                        that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - before treat answeredMsg.");
                        if (stanzaMessage.getChild( "answeredMsg")) {
                            answeredMsgId = stanzaMessage.getChild("answeredMsg").text();
                            answeredMsgStamp = stanzaMessage.getChild("answeredMsg").getAttr("stamp");
                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString() : undefined;

                            that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

/*
                            if (answeredMsgId) {

                                //let conversation = that._conversationService.getConversationById(conversation.id);
                                that._logger.log(that.DEBUG, LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                                if (conversation.historyDefered) {
                                    //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                    conversation.historyDefered.then(async () => {
                                        answeredMsg = await conversation.getMessageById(answeredMsgId);
                                    });
                                }
                            }
*/
                        }

                        if (!from) {
                            that._logger.log(that.WARN, LOG_ID + "(onHistoryMessageReceived) missing contact for jid : " + fromJid + ", ignore message");
                            //create basic contact
                            from = that._contactsService.createEmptyContactContact(fromJid);
                        }

                        if (roomEvent) {
                            that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) Conversation : " + conversation.id + ", add Room admin event message " + roomEvent);
                            type = "admin";

                            // Ignore meeting events
                            if (conversation.bubble && conversation.bubble.isMeetingBubble()) {
                                if (roomEvent === "welcome" ||
                                    roomEvent === "conferenceAdd" ||
                                    roomEvent === "conferenceRemove" ||
                                    roomEvent === "invitation") {
                                    return true;
                                }
                            }

                            if ((roomEvent === "conferenceAdd" || roomEvent === "conferenceRemove") && conversation.bubble && conversation.bubble.creator) {
                                let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                                from = ownerContact;
                            }
                        }

                        let message = conversation.getMessageById(messageId);
                        if (!message) { message = conversation.historyMessages.find((item) => { return item.id === messageId; }); }
                        if (message) {
                            that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) Conversation : " + conversation.id + ", try to add an already stored message with id " + message.id);
                        }
                        else {
                            // Create new message
                            let side = that._contactsService.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;
                            switch (type) {
                                case "webrtc":
                                    message = Message.createWebRTCMessage(messageId, date, from, side, body, false);
                                    break;
                                case "admin":
                                    /* let forwardedElmt = stanzaMessage.find("forwarded");
                                    if (forwardedElmt && forwardedElmt.length > 0 && forwardedElmt.attrs.xmlns === "urn:xmpp:forward:0") {
                                        isForwarded = true;
                                        let msg = forwardedElmt.getChild("message");
                                        forwardedMsg = {
                                            "origMsgId" : msg.attrs.id,
                                            "fromJid": msg.attrs.from,
                                            "to" : msg.attrs.to,
                                            "type" : msg.attrs.type,
                                            "body" : msg.getChild("body").text(),
                                            "lang" : msg.getChild("body").attrs["xml:lang"]
                                        };
                                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) message - forwardedMsg : ", forwardedMsg);
                                    } // */

                                    bodyEvent = stanzaMessage.find("body")?.text();// <body>Vincent04 Berder04 a rejoint la bulle</body>
                                    subjectEvent = stanzaMessage.find("subject")?.text();// <subject>room event</subject>

                                    message = Message.createBubbleAdminMessage(messageId, date, from, roomEvent, bodyEvent, subjectEvent);
                                    let eventElmt2 = stanzaMessage.find("event");
                                    if (eventElmt2?.length > 0) {
                                        if (Array.isArray(eventElmt2)) {
                                            eventElmt2.forEach((content) => {
                                                message.event = content.attr("name") + "";
                                                //  that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - event, roomEvent : ", roomEvent, ", fromJid  : ", fromJid );
                                            });
                                        } else {
                                            message.event = eventElmt2.attr("name") + "";
                                            //that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - event, roomEvent : ", roomEvent, ", fromJid  : ", fromJid );
                                        }
                                        message.isEvent = true;
                                    }

                                    break;
                                default:
                                    /*  if (oob && oob.children.length) {
                                          let url = oob.getChild("url").text();
                                          let mime = oob.getChild("mime").text();
                                          let filename = oob.getChild("filename").text();
                                          let filesize = oob.getChild("size").text();
                                          let fileId = Message.extractFileIdFromUrl(url);
  
                                          attachIndex = oob.attrs.index;
                                          attachNumber = oob.attrs.count;
  
                                          // TODO later - let fileDescriptor = fileStorageService.getFileDescriptorById(fileId);
  
                                          let shortFileDescriptor = {
                                              id: fileId,
                                              url: url,
                                              mime: mime,
                                              filename: filename,
                                              filesize: filesize,
                                              previewBlob: null,
                                              // TODO later - status: ( fileDescriptor )?fileDescriptor.state:"deleted"
                                          };
  
                                          message = Message.createFileSharingMessage(messageId, date, from, side, body, false, shortFileDescriptor);
  
                                      } else {*/
                                    let isMarkdown = content && content.getAttr("type")==="text/markdown";
                                    body = isMarkdown ? content.text():body;
                                    subject = stanzaMessage.find("subject").text();
                                    attention = stanzaMessage.find("attention").text()==="true" ? true:false;

                                    const headersElem = stanzaMessage.find("headers");
                                    if (headersElem && headersElem.length > 0) {
                                        if ( Array.isArray(headersElem) ) {
                                            for (let i = 0; i <headersElem.length ; i++) {
                                                const urgencyElem = headersElem[i].find("header");
                                                if (urgencyElem.length===1) {
                                                    if (urgencyElem.attrs.name=='Urgency') {
                                                        urgency = urgencyElem.text();
                                                    }
                                                } else {
                                                    for (let i = 0; i < urgencyElem.length; i++) {
                                                        if (urgencyElem[i].attrs.name=='Urgency') {
                                                            urgency = urgencyElem.text();
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            const urgencyElem = headersElem.find("header");
                                            if (urgencyElem.length===1) {
                                                if (urgencyElem.attrs.name=='Urgency') {
                                                    urgency = urgencyElem.text();
                                                }
                                            } else {
                                                for (let i = 0; i < urgencyElem.length; i++) {
                                                    if (urgencyElem[i].attrs.name=='Urgency') {
                                                        urgency = urgencyElem.text();
                                                    }
                                                }
                                            }
                                        }
                                        urgencyAck = true;
                                    }

                                    let attachTo = stanzaMessage.find("attach-to");
                                    if (attachTo && attachTo.length > 0 && attachTo.attrs.xmlns==="urn:xmpp:message-attaching:1") {
                                        attachedMsgId = attachTo.attrs.id;
                                    } else {
                                        that._logger.log(that.WARN, LOG_ID + "(onHistoryMessageReceived) message - unknown attachedMsgId : ", attachedMsgId);
                                    }

                                    resource = xu.getResourceFromFullJID(stanzaMessage.attrs.from);
                                    toJid = stanzaMessage.attrs.to;

                                    if (stanzaMessage.attrs["xml:lang"]) { // in <body>
                                        lang = stanzaMessage.attrs["xml:lang"];
                                    } /*else if (content.parent.attrs["xml:lang"]) { // in <message>
                                        lang = content.parent.attrs["xml:lang"];
                                    }*/ else {
                                        lang = "en";
                                    }
                                    that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) message - lang : ", lang);
                                    let eventElmt = stanzaMessage.find("event");
                                    if (eventElmt?.length > 0) {
                                        event = eventElmt.attrs.name;
                                        eventJid = eventElmt.attrs.jid;
                                        isEvent = true;
                                    }

                                    if (oobElmt) {
                                        attachIndex = oobElmt.attrs.index;
                                        attachNumber = oobElmt.attrs.count;
                                        oob = {
                                            url: oobElmt.getChild("url").getText(),
                                            mime: oobElmt.getChild("mime").getText(),
                                            filename: oobElmt.getChild("filename").getText(),
                                            filesize: oobElmt.getChild("size").getText()
                                        };
                                        that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) oob received");
                                    }

                                    let fromBubbleJid = "";
                                    let fromBubbleUserJid = "";
                                    if (stanza.attrs.type===TYPE_GROUPCHAT) {
                                        fromBubbleJid = xu.getBareJIDFromFullJID(stanza.attrs.from);
                                        fromBubbleUserJid = xu.getResourceFromFullJID(stanza.attrs.from);
                                        resource = xu.getResourceFromFullJID(fromBubbleUserJid);
                                    }

                                    let outgoingMessage = that._contactsService.isUserContactJid(fromJid);
                                    let conversationId = outgoingMessage ? toJid:(stanza.attrs.type===TYPE_GROUPCHAT ? fromBubbleJid:fromJid);

                                    let replaceElmt = stanzaMessage.find("replace");
                                    if (replaceElmt.length > 0) {

                                        let replaceMessageId = replaceElmt.attrs.id;

                                        if (replaceMessageId) {
                                            //data.replaceMessageId = replaceMessageId;
                                            let conversation = that._conversationService.getConversationById(conversationId);
                                            if (conversation) {
                                                originalMessageReplaced = conversation.getMessageById(replaceMessageId);
                                            } else {
                                                that._logger.log(that.WARN, LOG_ID + "(onHistoryMessageReceived) This is a replace msg but no conversation found for the original msg id. So store an empty msg to avoid the lost of information.", replaceMessageId);
                                                originalMessageReplaced = {};
                                                originalMessageReplaced.id = replaceMessageId;
                                            }
                                            //data.originalMessageReplaced.replacedByMessage = data;
                                        }
                                    }

                                    let forwardedElmt = stanzaMessage.find("forwarded");
                                    if (forwardedElmt && forwardedElmt.length > 0 && forwardedElmt.attrs.xmlns === "urn:xmpp:forward:0") {
                                        isForwarded = true;
                                        let msg = forwardedElmt.getChild("message");
                                        forwardedMsg = {
                                            "origMsgId" : msg.attrs.id,
                                            "fromJid": msg.attrs.from,
                                            "to" : msg.attrs.to,
                                            "type" : msg.attrs.type,
                                            "body" : msg.getChild("body").text(),
                                            "lang" : msg.getChild("body").attrs["xml:lang"]
                                        };                                        
                                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) message - forwardedMsg : ", forwardedMsg);
                                    }

                                    deletedMsg = stanzaMessage.find("delete").length > 0;
                                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) message - deletedMsg : ", deletedMsg);
                                    modifiedMsg = stanzaMessage.find("modify").length > 0;
                                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) message - modifiedMsg : ", modifiedMsg);
                                        
                                    let mentionElmt = stanzaMessage.find("mention");
                                    // stanzaData.mentions = [];
                                        
                                    if (mentionElmt.length > 0) {
                                        const mentionJidElem = mentionElmt.find("jid");
                                        if (Array.isArray(mentionJidElem)) {
                                            mentionJidElem.forEach((content) => {

                                                const mention = {};
                                                mention['jid'] = content.text();
                                                mention['pos'] = parseInt(content.attr("pos"), 10);
                                                mention['size'] = parseInt(content.attr("size"), 10);

                                                if (mention['jid'] && mention['size']) {
                                                    mentions.push(mention);
                                                }
                                                if (that.jid_im == mention['jid']) {
                                                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) message - attention found in mention.");
                                                    attention = true;
                                                }
                                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) message - mention : ", mention, ", that.jid_im  : ", that.jid_im , ", mention['jid'] : ", mention['jid']);
                                            });
                                        } else {
                                            const mention = {};
                                            mention['jid'] = mentionJidElem.text();
                                            mention['pos'] = parseInt(mentionJidElem.attr("pos"), 10);
                                            mention['size'] = parseInt(mentionJidElem.attr("size"), 10);

                                            if (mention['jid'] && mention['size']) {
                                                mentions.push(mention);
                                            }
                                            if (that.jid_im == mention['jid']) {
                                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) message - attention found in mention.");
                                                attention = true;
                                            }
                                            that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) message - mention : ", mention, ", that.jid_im  : ", that.jid_im , ", mention['jid'] : ", mention['jid']);
                                        }
                                    }
                                    //message = Message.create(messageId, date, from, side, body, false, answeredMsg, answeredMsgId, answeredMsgDate, answeredMsgStamp, isMarkdown);
                                    //a.isMarkdown = data.alternativeContent ? (data.alternativeContent[0]).type === "text/markdown" : false;

                                    //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, data.side, data.content, null, data.answeredMsg, data.answererdMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.);
                                    // let dataMessage : Message = await Message.create(
                                    //         messageId, 
                                    //         type, 
                                    //         date, 
                                    //         from, 
                                    //         side, 
                                    //         body, 
                                    //         false, 
                                    //         answeredMsg, 
                                    //         answeredMsgId, 
                                    //         answeredMsgDate, 
                                    //         answeredMsgStamp, 
                                    //         isMarkdown, 
                                    //         "",
                                    //         /*data.subject, */ 
                                    //         "",
                                    //         /*data.attention, */
                                    //         null,
                                    //         /* data.geoloc, */
                                    //         {},
                                    //         /* data.alternativeContent, */
                                    // );
                                    let dataMessage: Message = await Message.create(
                                            null,
                                            null,
                                            messageId,
                                            type,
                                            date,
                                            from,
                                            side,
                                            null,
                                            Message.ReceiptStatus.NONE,
                                            isMarkdown,
                                            subject,
                                            null, //data.geoloc,
                                            null, //data.voiceMessage,
                                            body, // data.alternativeContent,
                                            attention,
                                            mentions,
                                            urgency,
                                            urgencyAck,
                                            urgencyHandler,
                                            //data.translatedText,
                                            //data.isMerged,
                                            messageId,
                                            //data.showCorrectedMessages,
                                            //data.replaceMsgs,
                                            attachedMsgId,
                                            attachIndex,
                                            attachNumber,
                                            resource,
                                            toJid,
                                            body, //data.content,
                                            lang,
                                            false, //data.cc,
                                            "", //data.cctype,
                                            isEvent,
                                            event,
                                            oob,
                                            fromBubbleJid,
                                            fromBubbleUserJid,
                                            answeredMsg,
                                            answeredMsgId,
                                            answeredMsgDate,
                                            answeredMsgStamp,
                                            eventJid,
                                            originalMessageReplaced,
                                            null, //data.confOwnerId,
                                            null, //data.confOwnerDisplayName,
                                            null,  //data.confOwnerJid,
                                            isForwarded,
                                            forwardedMsg,
                                            deletedMsg,
                                            modifiedMsg                                            
                                    );

                                    that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) with dataMessage Message : ", dataMessage.id, ", fromJid : ", dataMessage.fromJid, ", date : ", dataMessage.date, ", content : ", dataMessage.content);

                                    message = dataMessage;
                                    // }
                                    break;
                            }
                            // console.error("message "+ JSON.stringify(message.date));
                            message.receiptStatus = ack.getAttr("read") === "true" ? 5 : (ack.getAttr("received") === "true" ? 4 : 3);

                            // if (conversation.bubble) {
                            //  message.receiptStatus = 3;
                            // }

                            // message.updateMessage(message);
                            // that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) with dataMessage updated Message : ", message);
                            let hasATextMessage = false;
                            if (message.subject || message.alternativeContent || message.content ) {
                                hasATextMessage = true;
                            }
                            if (!hasATextMessage && !isForwarded && ! (deletedMsg) && !modifiedMsg) {
                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) with No message text, so ignore it! hasATextMessage : ", hasATextMessage, ", message : id : ", message.id, ", fromJid : ", message.fromJid, ", date : ", message.date, ", content : ", message.content);
                            } else {
                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) with message text, message : id : ", message.id, ", fromJid : ", message.fromJid, ", date : ", message.date, ", content : ", message.content);
                                conversation.historyMessages.push(message);
                            }
                            return Promise.resolve(undefined);
                        }
                    });
                    conversation.pendingPromise.push(promise);
                }
            }

            else {

                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) queryId not defined. Treat 'fin' history xml tag.");

                // Get associated conversation
                queryId = stanza.getChild("fin").getAttr("queryid");
                conversation = that._conversationService.getConversationById(queryId);
                if (conversation) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) getConversationById returned, conversation.id : ", conversation.id, ", conversation.messages.toSmallString() : ", that._logger.colors.yellow(conversation.messages.toSmallString()));
                    if ( conversation.pendingPromise ) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) conversation.pendingPromise is setted so wait allSettled, conversation.id : ", conversation.id);
                        Promise.allSettled( conversation.pendingPromise ).then(async () => {

                            // Extract info
                            conversation.historyComplete = stanza.getChild("fin").getAttr("complete") === "true";
                            let historyIndex = stanza.getChild("fin").getChild("set").getChild("first") ?
                                stanza.getChild("fin").getChild("set").getChild("first").text() : -1;

                            /* 
                            // Handle very particular case of historyIndex == -1
                            if (conversation.historyIndex === -1) {
                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) Handle very particular case of historyIndex == -1, concat messages from history : ", conversation.historyMessages, ", to conversation id : ", conversation.id);
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);
                            }
                            // Classic case
                            else {
                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) concat messages from history : ", conversation.historyMessages, ", to conversation id : ", conversation.id);
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);
                            }
                            // */
                            while (conversation.historyMessages.length > 0) {
                                const historyFirstElement = conversation.historyMessages.shift();
                                that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) start treatment of history message : msg id : ", historyFirstElement.id, ", fromJid : ", historyFirstElement.fromJid, ", date : ", historyFirstElement.date, ", content : ", historyFirstElement.content, " for conversation.messages, conversation.id : ", conversation.id);
                                let messageUpdated = false;
                                /*
                                conversation.messages.forEach((elmt : Message) => {
                                   if (elmt.id == historyFirstElement.id || elmt.historyIndex == historyFirstElement.historyIndex) {
                                       elmt.updateMessage(historyFirstElement);
                                       messageUpdated = true;
                                   }  
                                });
                                // */
                                for (let i = 0; i < conversation.messages.length; i++) {
                                    const elmt: Message = conversation.messages[i];

                                    if ((isDefined(elmt.id) && isDefined(historyFirstElement.id) && elmt.id === historyFirstElement.id) || ( isDefined(elmt.historyIndex) && isDefined(elmt.historyIndex) && elmt.historyIndex === historyFirstElement.historyIndex)) {
                                        that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) msg updateMessage - elmt.id : ", elmt.id, ", historyFirstElement.id : ", historyFirstElement.id, ", elmt.historyIndex : ", elmt.historyIndex, ", historyFirstElement.historyIndex : ", historyFirstElement.historyIndex);
                                        elmt.updateMessage(historyFirstElement);
                                        messageUpdated = true;
                                    }
                                }
                                if (!messageUpdated) {
                                    that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) msg id : ", historyFirstElement.id, ", message not updated from history, so added it to conversation.messages.length : ", conversation?.messages?.length, ", conversation.messages.toSmallString() : ", that._logger.colors.yellow(conversation.messages.toSmallString()));
                                    //conversation.messages.unshift.call(conversation.messages, [historyFirstElement]);
                                  //  conversation.messages.unshift.apply(conversation.messages, [historyFirstElement]);
                                    conversation.messages.unshift(historyFirstElement);
                                    that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) msg id : ", historyFirstElement.id, ", message not updated from history, so added it to conversation.messages.length : ", conversation?.messages?.length, ", conversation.messages.toSmallString() : ", that._logger.colors.yellow(conversation.messages.toSmallString()));
                                }  else {
                                    that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) msg id : ", historyFirstElement.id, ", message updated from history.");
                                }
                            }

                            conversation.historyIndex = historyIndex;
                            conversation.historyMessages = [];

                            /* comment that code because the sort and the seach of answered message info will be done when the retrieve of all history is finished.
                            //that._logger.log(that.INTERNAL, LOG_ID + "[Conversation] onHistoryMessageReceived conversation not ordered: ", conversation);
                            // @ts-ignore
                            conversation.messages.sort((msg1, msg2) => new Date(msg1.date) - new Date(msg2.date));
                            //that._logger.log(that.INTERNAL, LOG_ID + "[Conversation] onHistoryMessageReceived conversation ordered by date: ", conversation);
                            if (conversation.messages && conversation.messages.length > 0) {
                                conversation.lastMessageText = conversation.messages[conversation.messages.length - 1].content;
                            } else {
                                // conversation.lastModification = conversation.historyIndex === "" ? new Date() : new Date(0);
                                conversation.lastMessageText = "";
                            }

                            //conversation.messages.forEach(async (message)=> {
                            for (const message of conversation.messages) {
                                if (message.answeredMsgId) {
                                    //let conversation = that._conversationService.getConversationById(conversation.id);
                                    that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) with answeredMsg message try to search its details, answeredMsgId : ", message.answeredMsgId, ", conversation.id: ", conversation.id);
                                    //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                    message.answeredMsg = await conversation.getMessageById(message.answeredMsgId);
                                }
                            };
                            //});
                            // */

                            that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) conversation.historyDefered before resolve conversation.messages.toSmallString() : ", that._logger.colors.yellow(conversation.messages.toSmallString()));
                            conversation.historyDefered.resolve(conversation);
                            delete conversation.pendingPromise;
                        }).catch ((err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(onHistoryMessageReceived) error in waited pending promises : ", err);
                        });
                    } else {

                        // @ts-ignore
                        conversation.messages.sort((msg1, msg2) => new Date(msg1.date) - new Date(msg2.date));
                        //that._logger.log(that.INTERNAL, LOG_ID + "[Conversation] onHistoryMessageReceived conversation ordered by date: ", conversation);
                        if (conversation.messages && conversation.messages.length > 0) {
                            conversation.lastMessageText = conversation.messages[conversation.messages.length - 1].content;
                        } else {
                            // conversation.lastModification = conversation.historyIndex === "" ? new Date() : new Date(0);
                            conversation.lastMessageText = "";
                        }

                        //conversation.messages.forEach(async (message)=> {
                        for (const message of conversation.messages) {
                            if (message.answeredMsgId) {
                                //let conversation = that._conversationService.getConversationById(conversation.id);
                                that._logger.log(that.DEBUG, LOG_ID + "(onHistoryMessageReceived) with answeredMsg message try to search its details, answeredMsgId : ", message.answeredMsgId, ", conversation.id: ", conversation.id);
                                //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                message.answeredMsg = conversation.getMessageById(message.answeredMsgId);
                            }
                        };


                        // @ts-ignore
                     //  conversation.messages.sort( ( msg1, msg2 ) => new Date(msg1.date) - new Date(msg2.date) );

                        /* conversation.messages.forEach(async (message)=> {
                            if (message.answeredMsgId) {
                                //let conversation = that._conversationService.getConversationById(conversation.id);
                                that._logger.log(that.DEBUG, LOG_ID + "(_onMessageReceived) with answeredMsg message try to search its details, answeredMsgId : ", message.answeredMsgId, ", conversation.id: ", conversation.id);
                                //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                message.answeredMsg = await conversation.getMessageById(message.answeredMsgId);
                            }
                        }); */

                        that._logger.log(that.INTERNAL, LOG_ID + "(onHistoryMessageReceived) conversation.historyComplete = true, conversation.messages.toSmallString() : ", that._logger.colors.yellow(conversation.messages.toSmallString()));
                        conversation.historyComplete = true;
                        conversation.historyDefered.resolve(conversation);
                    }

                }
            }

            return true;
        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onHistoryMessageReceived) error ");
            that._logger.log(that.ERROR, LOG_ID + "(onHistoryMessageReceived) error : ", error);
            return true;
        }
    }

    onWebrtcHistoryMessageReceived (stanza, conversation) {
        let that = this;
        try {
            let stanzaMessage = stanza.getChild("result").getChild("forwarded").getChild("message");
            let messageId = stanzaMessage.getAttr("id");
            let stanzaMessageCallLog = stanzaMessage.getChild("call_log");
            let callerJid = stanzaMessageCallLog.getChild("caller").text();
            let state = stanzaMessageCallLog.getChild("state").text();
            let duration = 0;
            let durationTxt = "0";

            if (stanzaMessageCallLog.getChild("duration")) {
                duration = stanzaMessageCallLog.getChild("duration").text();
                duration = parseInt(String(duration), 10);
            }

            if (duration > 0) {
                durationTxt = "(" + moment.duration(duration, "ms").format("h[H] mm[m] ss[s]") + ")";
            } else {
                duration = 0;
            }

            let date = stanzaMessageCallLog.getChild("date").text();

            if (date) {
                date = new Date(date);
            }
            else {
                date = new Date(stanza.getChild("result").getChild("forwarded").getChild("delay").attr("stamp"));
            }

            let body = "";
            if (state === "missed") {
                body = "missedCall||" + date;
            } else if (state === "answered") {
                body = "activeCallMsg||" + date + "||" + durationTxt;
            }

            let message = conversation.getMessageById(messageId);
            if (!message) { message = conversation.historyMessages.find(function(item) { return item.id === messageId; }); }

            if (message) {
                that._logger.log(that.DEBUG, LOG_ID + "[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
            }
            else {
                if ( !conversation.pendingPromise ) {
                    conversation.pendingPromise = [];
                }

                let promise = new Promise( (resolve) => {
                    that._contactsService.getContactByJid(callerJid, that.forceHistoryGetContactFromServer)
                        .then( (from) => {
                            resolve(from);
                        }).catch( () => {
                        resolve(null);
                    });
                }).then( (from : any) => {
                    // Create new message
                    if (!from) {
                        that._logger.log(that.WARN, LOG_ID + "[Conversation] onWebrtcHistoryMessageReceived missing contact for jid : " + callerJid + ", ignore message");
                        //create basic contact
                        from = that._contactsService.createEmptyContactContact(callerJid);
                    }

                    let side = that._contactsService.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;

                    message = Message.createWebRTCMessage(messageId, date, from, side, body, false);

                    let ack = stanzaMessage.getChild('ack');
                    if (ack) {
                        message.receiptStatus = ack.getAttr("read") === "true" ? 5 : (ack.getAttr("received") === "true" ? 4 : 3);
                    }

                    conversation.historyMessages.push(message);
                    return Promise.resolve(undefined);
                });
                conversation.pendingPromise.push(promise);
            }

            return true;
        } catch (error) {
            console.error(error);
            return true;
        }
    }
}

export {ConversationHistoryHandler};
module.exports.ConversationHistoryHandler = ConversationHistoryHandler;
