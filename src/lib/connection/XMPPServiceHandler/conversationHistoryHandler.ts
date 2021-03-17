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

const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");
import {Message} from "../../common/models/Message";
import {logEntryExit} from "../../common/Utils";
import {ConversationsService} from "../../services/ConversationsService";
import {ContactsService} from "../../services/ContactsService";
import {stringify} from "querystring";

const LOG_ID = "XMPP/HNDL/HIST/CONV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class ConversationHistoryHandler  extends GenericHandler.GenericHandler {
	public MESSAGE_MAM: any;
	public FIN_MAM: any;
	public _conversationService: ConversationsService;
	private _contactsService : ContactsService;

    static getClassName(){ return 'ConversationHistoryHandler'; }
    getClassName(){ return ConversationHistoryHandler.getClassName(); }

    constructor(xmppService : XMPPService, conversationService : ConversationsService, contactsService : ContactsService) {
        super( xmppService);

        this.MESSAGE_MAM = "urn:xmpp:mam:1.result";
        this.FIN_MAM = "urn:xmpp:mam:1.fin";

        this._conversationService = conversationService;
        this._contactsService = contactsService;

        let that = this;


    }

    onMamMessageReceived (msg, stanza) {
        let that = this;
        try {
            // Get queryId and deleteId
            let queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
            if (!queryId) {
                queryId = stanza.getChild("fin") ? stanza.getChild("fin").getAttr("queryid") : null;
            }

            // jidTel are used for callLog
            if (queryId && queryId.indexOf("tel_") !== 0 && that.onHistoryMessageReceived) {
                that.onHistoryMessageReceived(msg, stanza);
            }

            // jidIm are used for history
            else if (that.callLogHandler) {
                that.callLogHandler(stanza);
            }

            return true;
        } catch (error) {
            return true;
        }

    }

    onHistoryMessageReceived (msg, stanza) {
        let that = this;
        // Handle response
        try {
            var conversation = null;
            that.logger.log("internal", LOG_ID + "(onHistoryMessageReceived) _entering_ : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

            var queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
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

                    var brutJid = stanzaMessage.getAttr("from");

                    // Extract fromJid
                    let fromJid;
                    let roomEvent = null;
                    if (brutJid.indexOf("room_") === 0) { fromJid = brutJid.split("/")[1]; }
                    else { fromJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(brutJid); }

                    if (!fromJid && stanzaMessage.getChild("event")) {
                        roomEvent = stanzaMessage.getChild("event").attr("name") + "";
                        fromJid = stanzaMessage.getChild("event").attr("jid");

                        if (roomEvent === "welcome" && conversation.bubble && conversation.bubble.creator) {
                            let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                            fromJid = ownerContact ? ownerContact.jid_im : "";
                        }
                    }

                    if (!fromJid) {
                        that.logger.log("warn", LOG_ID + "(onHistoryMessageReceived) - Receive message without valid fromJid information");
                        return true;
                    }

                    if ( !conversation.pendingPromise ) {
                        conversation.pendingPromise = [];
                    }

                    let promise = new Promise( (resolve) => {
                        that._contactsService.getContactByJid(fromJid, true)
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
                        let mentions : Array<Object> = [];


                        that.logger.log("info", LOG_ID + "(onHistoryMessageReceived) message - before treat answeredMsg.");
                        if (stanzaMessage.getChild( "answeredMsg")) {
                            answeredMsgId = stanzaMessage.getChild("answeredMsg").text();
                            answeredMsgStamp = stanzaMessage.getChild("answeredMsg").getAttr("stamp");
                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString() : undefined;

                            that.logger.log("info", LOG_ID + "(onHistoryMessageReceived) message - answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

/*
                            if (answeredMsgId) {

                                //let conversation = that._conversationService.getConversationById(conversation.id);
                                that.logger.log("debug", LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
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
                            that.logger.log("warn", LOG_ID + "(onHistoryMessageReceived) missing contact for jid : " + fromJid + ", ignore message");
                            //create basic contact
                            from = that._contactsService.createEmptyContactContact(fromJid);
                        }

                        if (roomEvent) {
                            that.logger.log("internal", LOG_ID + "(onHistoryMessageReceived) Conversation : " + conversation.id + ", add Room admin event message " + roomEvent);
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
                            that.logger.log("info", LOG_ID + "(onHistoryMessageReceived) Conversation : " + conversation.id + ", try to add an already stored message with id " + message.id);
                        }
                        else {
                            // Create new message
                            let side = that._contactsService.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;
                            switch (type) {
                                case "webrtc":
                                    message = Message.createWebRTCMessage(messageId, date, from, side, body, false);
                                    break;
                                case "admin":
                                    message = Message.createBubbleAdminMessage(messageId, date, from, roomEvent);
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
                                        urgencyAck = true;
                                    }

                                    let attachTo = stanzaMessage.find("attach-to");
                                    if (attachTo && attachTo.length > 0 && attachTo.attrs.xmlns==="urn:xmpp:message-attaching:1") {
                                        attachedMsgId = attachTo.attrs.id;
                                    } else {
                                        that.logger.log("warn", LOG_ID + "(onHistoryMessageReceived) message - unknown attachedMsgId : ", attachedMsgId);
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
                                    that.logger.log("info", LOG_ID + "(onHistoryMessageReceived) message - lang : ", lang);
                                    let eventElmt = stanzaMessage.find("event");
                                    if (eventElmt.length > 0) {
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
                                        that.logger.log("info", LOG_ID + "(onHistoryMessageReceived) oob received");
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
                                                that.logger.log("warn", LOG_ID + "(onHistoryMessageReceived) This is a replace msg but no conversation found for the original msg id. So store an empty msg to avoid the lost of information.", replaceMessageId);
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
                                        that.logger.log("internal", LOG_ID + "(onChatMessageReceived) message - forwardedMsg : ", forwardedMsg);
                                    }

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
                                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - mention : ", mention);
                                            });
                                        } else {
                                            const mention = {};
                                            mention['jid'] = mentionJidElem.text();
                                            mention['pos'] = parseInt(mentionJidElem.attr("pos"), 10);
                                            mention['size'] = parseInt(mentionJidElem.attr("size"), 10);

                                            if (mention['jid'] && mention['size']) {
                                                mentions.push(mention);
                                            }
                                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - mention : ", mention);
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
                                            forwardedMsg
                                    );

                                    that.logger.log("internal", LOG_ID + "(onHistoryMessageReceived) with dataMessage Message : ", dataMessage);

                                    message = dataMessage;
                                    // }
                                    break;
                            }
                            // console.error("message "+ JSON.stringify(message.date));
                            message.receiptStatus = ack.getAttr("read") === "true" ? 5 : (ack.getAttr("received") === "true" ? 4 : 3);

                            // if (conversation.bubble) {
                            // 	message.receiptStatus = 3;
                            // }

                            // message.updateMessage(message);
                            // that.logger.log("internal", LOG_ID + "(_onMessageReceived) with dataMessage updated Message : ", message);
                            conversation.historyMessages.push(message);
                            return Promise.resolve(undefined);
                        }
                    });
                    conversation.pendingPromise.push(promise);
                }
            }

            else {

                that.logger.log("debug", LOG_ID + "(onHistoryMessageReceived) queryId not defined. Treat 'fin' history xml tag.");

                // Get associated conversation
                queryId = stanza.getChild("fin").getAttr("queryid");
                conversation = that._conversationService.getConversationById(queryId);
                if (conversation) {

                    if ( conversation.pendingPromise ) {
                        Promise.all( conversation.pendingPromise ).then( () => {

                            // Extract info
                            conversation.historyComplete = stanza.getChild("fin").getAttr("complete") === "true";
                            let historyIndex = stanza.getChild("fin").getChild("set").getChild("first") ?
                                stanza.getChild("fin").getChild("set").getChild("first").text() : -1;

                            // Handle very particular case of historyIndex == -1
                            if (conversation.historyIndex === -1) {
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                                if (conversation.chatRenderer) {
                                    conversation.chatRenderer.prependMessages(conversation.messages, conversation.bubble);
                                }
                            }

                            // Classic case
                            else {
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                                if (conversation.chatRenderer) {
                                    conversation.chatRenderer.prependMessages(conversation.historyMessages, conversation.bubble);
                                }
                            }

                            conversation.historyIndex = historyIndex;
                            conversation.historyMessages = [];

                            //that.logger.log("internal", LOG_ID + "[Conversation] onHistoryMessageReceived conversation not ordered: ", conversation);
                            // @ts-ignore
                            conversation.messages.sort((msg1, msg2) => new Date(msg1.date) - new Date(msg2.date));
                            //that.logger.log("internal", LOG_ID + "[Conversation] onHistoryMessageReceived conversation ordered by date: ", conversation);
                            if (conversation.messages && conversation.messages.length > 0) {
                                conversation.lastMessageText = conversation.messages[conversation.messages.length - 1].content;
                            } else {
                                // conversation.lastModification = conversation.historyIndex === "" ? new Date() : new Date(0);
                                conversation.lastMessageText = "";
                            }

                            conversation.messages.forEach(async (message)=> {
                                if (message.answeredMsgId) {
                                    //let conversation = that._conversationService.getConversationById(conversation.id);
                                    that.logger.log("debug", LOG_ID + "(onHistoryMessageReceived) with answeredMsg message try to search its details, answeredMsgId : ", message.answeredMsgId, ", conversation.id: ", conversation.id);
                                    //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                    message.answeredMsg = await conversation.getMessageById(message.answeredMsgId);
                                }
                            });

                            conversation.historyDefered.resolve(conversation);
                            delete conversation.pendingPromise;
                        });
                    } else {
                        // @ts-ignore
                        conversation.messages.sort( ( msg1, msg2 ) => new Date(msg1.date) - new Date(msg2.date) );

                        /* conversation.messages.forEach(async (message)=> {
                            if (message.answeredMsgId) {
                                //let conversation = that._conversationService.getConversationById(conversation.id);
                                that.logger.log("debug", LOG_ID + "(_onMessageReceived) with answeredMsg message try to search its details, answeredMsgId : ", message.answeredMsgId, ", conversation.id: ", conversation.id);
                                //answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //
                                message.answeredMsg = await conversation.getMessageById(message.answeredMsgId);
                            }
                        }); */

                        conversation.historyComplete = true;
                        conversation.historyDefered.resolve(conversation);
                    }

                }
            }

            return true;
        } catch (error) {
            that.logger.log("error", LOG_ID + "(onHistoryMessageReceived) error ");
            that.logger.log("internalerror", LOG_ID + "(onHistoryMessageReceived) error : ", error);
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
                that.logger.log("info", LOG_ID + "[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
            }
            else {
                if ( !conversation.pendingPromise ) {
                    conversation.pendingPromise = [];
                }

                let promise = new Promise( (resolve) => {
                    that._contactsService.getContactByJid(callerJid, true)
                        .then( (from) => {
                            resolve(from);
                        }).catch( () => {
                        resolve(null);
                    });
                }).then( (from : any) => {
                    // Create new message
                    if (!from) {
                        that.logger.log("warn", LOG_ID + "[Conversation] onWebrtcHistoryMessageReceived missing contact for jid : " + callerJid + ", ignore message");
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
