"use strict";
import {xu} from "../../common/XMPPUtils";
import {ConversationsService} from "../../services/ConversationsService";
import {Conversation} from "../../common/models/Conversation";
import {Element} from "ltx";
import {getJsonFromXML, logEntryExit} from "../../common/Utils";
import {FileStorageService} from "../../services/FileStorageService";
import {FileServerService} from "../../services/FileServerService";
import {BubblesService} from "../../services/BubblesService";
import {ContactsService} from "../../services/ContactsService";
import {Message} from "../../common/models/Message";
import {GenericHandler} from "./GenericHandler";
import {WebConferenceSession} from "../../common/models/webConferenceSession";
import {WebConferenceParticipant} from "../../common/models/webConferenceParticipant";
import {Contact} from "../../common/models/Contact";
import {
    ConferenceSession,
    Participant,
    Publisher,
    Service,
    Silent,
    Talker
} from "../../common/models/ConferenceSession";
import {List} from "ts-generic-collections-linq";
import {PresenceService} from "../../services/PresenceService";
import {NameSpacesLabels, XMPPService} from "../XMPPService";
import {DataStoreType} from "../../config/config.js";

export {};


//const GenericHandler = require("./GenericHandler");

const util = require('util');

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/EVENT/CONV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class ConversationEventHandler extends GenericHandler {
    public MESSAGE: string;
    public MESSAGE_CHAT: string;
    public MESSAGE_SET: string;
    public MESSAGE_GROUPCHAT: string;
    public MESSAGE_WEBRTC: string;
    public MESSAGE_MANAGEMENT: string;
    public MESSAGE_ERROR: string;
    public MESSAGE_HEADLINE: string;
    public MESSAGE_CLOSE: string;
    private _conversationService: ConversationsService;
    public findAttrs: any;
    public findChildren: any;
    private _fileStorageService: FileStorageService;
    private _fileServerService: FileServerService;
    private _bubbleService: BubblesService;
    private _contactsService: ContactsService;
    private _presenceService: PresenceService;
    private storeMessagesInConversation: any;
    private maxMessagesStoredInConversation: any;

    static getClassName() { return 'ConversationEventHandler'; }
    getClassName() { return ConversationEventHandler.getClassName(); }

    static getAccessorName(){ return 'conversationevent'; }
    getAccessorName(){ return ConversationEventHandler.getAccessorName(); }

    constructor(xmppService : XMPPService, conversationService,  imOptions, fileStorageService, fileServerService, bubbleService, contactsService, presenceService) {
        super(xmppService);

        this.MESSAGE = "jabber:client.message";
        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_SET = "jabber:client.message.set";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this._conversationService = conversationService;
        this._fileStorageService = fileStorageService;
        this._fileServerService = fileServerService;
        this._bubbleService = bubbleService;
        this._contactsService = contactsService;
        this._presenceService = presenceService;
        this.storeMessagesInConversation = imOptions.storeMessagesInConversation;
        this.maxMessagesStoredInConversation = imOptions.maxMessagesStoredInConversation;

        let that = this;

        this.findAttrs = () => {

        };

        /*
        this.findChildren = (element) => {
            try {
                that._logger.log(that.DEBUG, LOG_ID + "(findChildren) _entering_");
                that._logger.log(that.INTERNAL, LOG_ID + "(findChildren) _entering_", element);
                that._logger.log(that.ERROR, LOG_ID + "(findChildren) findChildren element : ", element, " name : ", element.getName());
                let json = {};
                //let result = null;
                let children = element.children;
                if (children.length > 0) {
                    json[element.getName()] = {};
                    let childrenJson = json[element.getName()];
                    children.forEach((elemt) => {
                        // @ts-ignore
                        if (typeof elemt.children === Array) {
                            that._logger.log(that.ERROR, LOG_ID + "(findChildren)  children.forEach Array : ", element, ", elemt : ", elemt);
                            childrenJson[elemt.getName()] = elemt.children[0];
                        }
                        that._logger.log(that.ERROR, LOG_ID + "(findChildren)  children.forEach element : ", element, ", elemt : ", elemt);
                        childrenJson[elemt.getName()] = this.findChildren(elemt);
                    });
                    return json;
                } else {
                    that._logger.log(that.ERROR, LOG_ID + "(findChildren)  No children element : ", element);
                    return element.getText();
                }
                //return result;
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(findChildren) CATCH Error !!! : ", err);
            }
        };

         */

    }

    private async createSessionParticipantFromElem(participantElem: any): Promise<WebConferenceParticipant> {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(createSessionParticipantFromParticipantElem) participantElem : ", participantElem);
            let contactId = participantElem.find('user-id').text();
            if (!contactId) {
                contactId = participantElem.find('participant-id').text();
            }
            const role = participantElem.find('role').text();
            const contact: Contact = await this._contactsService.getContactById(contactId).catch(() => {
                that._logger.log(that.INTERNAL, LOG_ID + "(createSessionParticipantFromParticipantElem) No contact found. ");
                return null;
            });

            if (contact) {
                const sessionParticipant = WebConferenceParticipant.create(contactId);
                sessionParticipant.contact = contact;
                sessionParticipant.mute = participantElem.find('mute').text()==='true';
                sessionParticipant.delegateCapability = participantElem.find("delegate-capability").text()==='true';
                sessionParticipant.role = role;
                return sessionParticipant;
            }

            return null;
        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(createSessionParticipantFromParticipantElem) CATCH Error !!!");
            that._logger.log(that.ERROR, LOG_ID + "(createSessionParticipantFromParticipantElem) CATCH Error !!! error : ", error);
            return null;
        }
    }

    async parseConferenceV2UpdatedEvent(stanza, id, node) {
        let that = this;

        that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) __entering__ ");
        that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) stanza : ", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, ", node : ", node);

        let xmlNodeStr = node ? node.toString():"<xml></xml>";
        let jsonNode = await getJsonFromXML(xmlNodeStr);
        that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", JSON conference-info : ", "\n", jsonNode);
        let conferenceInfo = jsonNode["conference-info"];
        //that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) conferenceInfo : ", conferenceInfo);
//                        let bubble = undefined;

        let xmlnsNode = conferenceInfo["$attrs"]["xmlns"];
        if (xmlnsNode=="jabber:iq:conference:2" /* && !ignoreConferenceInfo*/ ) {
            let conferenceId = undefined;
            let updatedDatasForEvent = {};
            if (conferenceInfo.hasOwnProperty("conference-id")) {
                conferenceId = conferenceInfo["conference-id"];
            }
            if (conferenceInfo.hasOwnProperty("room-id")) {
                conferenceId = conferenceInfo["room-id"];
            }
            let webConferenceSession: WebConferenceSession = null;

            let stanzaElem = node;

            let conference: ConferenceSession = await that._bubbleService.getConferenceByIdFromCache(conferenceId);
            if (conference===null) {
                that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " create new ConferenceSession. conferenceId : ", conferenceId);
                conference = new ConferenceSession(conferenceId);
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " ConferenceSession found in BubblesService cache. conference : ", conference);
            }

            // We consider always conference as active expect if we receive the opposite information
            conference.active = true;

            let newConferenceId = undefined;
            if (conferenceInfo.hasOwnProperty("new-conference-id")) {
                newConferenceId = conferenceInfo["new-conference-id"];
                /* let newConference: ConferenceSession = await that._bubbleService.getConferenceByIdFromCache(newConferenceId);
                if (newConference==null) {
                    that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " create new ConferenceSession. newConferenceId : ", newConferenceId);
                    newConference = new ConferenceSession(newConferenceId);
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " ConferenceSession found in BubblesService cache. newConference : ", newConference);
                } // */

                try {
                    
                    if (conferenceId !== newConferenceId) {
                        let bubbleUpdated = await that._bubbleService.getBubbleById(conferenceId, true);
                        that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", conferenceInfo , with newConferenceId : ", newConferenceId, " in bubbleUpdated : ", bubbleUpdated);

                        let newConference: ConferenceSession = await that._bubbleService.getConferenceByIdFromCache(newConferenceId);
                        if (newConference==null) {
                            that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " create new ConferenceSession. newConferenceId : ", newConferenceId);
                            newConference = new ConferenceSession(newConferenceId);
                            // Attention : The conference is replaced by newConference, so List of Particpants, Publishers, Talkers, Silents are transfered to the newConference and these lists are reseted in original conference.
                        } else {
                            that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " ConferenceSession found in BubblesService cache. newConference : ", newConference);
                            // Attention : The conference is replaced by newConference, so List of Particpants, Publishers, Talkers, Silents are transfered to the newConference and these lists are reseted in original conference.
                        } // */
                        newConference.replaceConference = conference;
                        await this._bubbleService.addOrUpdateConferenceToCache(newConference, true);
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", conferenceInfo , with newConferenceId : ", newConferenceId, " egals to conferenceId : ", conferenceId, ", so no new conference need to be created.");
                        let newOwnerJidIm = conferenceInfo["new-owner-jid-im"];
                        conference.ownerJidIm = newOwnerJidIm;
                    }
                } catch (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + " CATCH Error !!! ConferenceSession with newConferenceId : ", newConferenceId, ", error : ", err);
                }
            }

            if (conferenceInfo.hasOwnProperty("conference-state")) {
                // conference-state
                let conferenceState = conferenceInfo["conference-state"];
                if (conferenceState) {
                    // We consider always conference as active expect if we receive the opposite information
                    if (conferenceState.hasOwnProperty("active"))
                        conference.active = !(conferenceState["active"]=="false");

                    if (conferenceState.hasOwnProperty("mute"))
                        conference.muted = (conferenceState["mute"]=="true")
                                || (conferenceState["mute"]._=="on");

                    if (conferenceState.hasOwnProperty("lock"))
                        conference.locked = (conferenceState["lock"]=="true")
                                || (conferenceState["lock"]._=="on");

                    if (conferenceState.hasOwnProperty("recording-started"))
                        conference.recordStarted = (conferenceState["recording-started"]=="true")
                                || (conferenceState["recording-started"]._=="on");

                    if (conferenceState.hasOwnProperty("talker-active"))
                        conference.talkerActive = (conferenceState["talker-active"]=="true")
                                || (conferenceState["talker-active"]._=="true");

                    if (conferenceState.hasOwnProperty("reason"))
                        conference.reason = conferenceState["reason"];
                    /*
                                                        if (conferenceState.hasOwnProperty("participant-count"))
                                                            conference.participantCount =  parseInt((conferenceState["participant-count"]) , 10);
                    
                                                        if (conferenceState.hasOwnProperty("publisher-count"))
                                                            conference.publisherCount =  parseInt((conferenceState["publisher-count"]) , 10);
                    */
                }
            }

            // media-state
            if (conferenceInfo.hasOwnProperty("media-type"))
                conference.mediaType = conferenceInfo["media-type"]._;

            // added-participants
            if (conferenceInfo.hasOwnProperty("added-participants")) {
                let addedParticipants = conferenceInfo["added-participants"];
                let addedParticipantsIdList: List<string> = that.parseIdFromConferenceUpdatedEvent(addedParticipants, "participant");
                updatedDatasForEvent["added-participants"] = addedParticipantsIdList;
                await that.parseParticipantsFromConferenceUpdatedEvent(conference, addedParticipants);
            }

            // updated-participants
            if (conferenceInfo.hasOwnProperty("updated-participants")) {
                let updatedParticipants = conferenceInfo["updated-participants"];
                let updatedParticipantsIdList: List<string> = that.parseIdFromConferenceUpdatedEvent(updatedParticipants, "participant");
                updatedDatasForEvent["updated-participants"] = updatedParticipantsIdList;
                await that.parseParticipantsFromConferenceUpdatedEvent(conference, updatedParticipants);
            }

            // participants
            if (conferenceInfo.hasOwnProperty("participants")) {
                let participants = conferenceInfo["participants"];
                await that.parseParticipantsFromConferenceUpdatedEvent(conference, participants);
            }

            let amIRemoved = false;

            // removed-participants
            if (conferenceInfo.hasOwnProperty("removed-participants")) {
                let removedParticipants = conferenceInfo["removed-participants"];
                let removedIdList: List<string> = that.parseIdFromConferenceUpdatedEvent(removedParticipants, "participant");
                updatedDatasForEvent["removed-participants"] = removedIdList;
               if (conference.participants!=null) {
                    let list: List<Participant> = conference.participants;
                    let myParticipant = conference.participants.where((item: Participant) => {
                        return item.jid_im===that.jid_im
                    });
                    for (let id of removedIdList.asEnumerable().toArray()) {
                        if (id===(myParticipant.elementAt(0)).id) {
                            amIRemoved = true;
                        }

                        list.remove((item: Participant) => {
                            return id===item.id;
                        });
                        /*for(let participant of list.asEnumerable().toArray())
                        {
                            if (participant.id == id)
                            {
                                list.remove(participant);
                                break;
                            }
                        }
                        // */
                    }
                    conference.participants = list;
                } // */
            }

            // talkers
            //that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + ", conference : ", conference, ", talkers", conferenceInfo["talkers"]);
            if (conferenceInfo.hasOwnProperty("talkers")) {
                let talkers = conferenceInfo["talkers"];
                //let talkersId = that.parseParticipantsIdFromConferenceUpdatedEvent(talkers);
                that.parseTalkersFromConferenceUpdatedEvent(conference, talkers);
            }

            // silents
            //that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + ", conference : ", conference, ", talkers", conferenceInfo["talkers"]);
            if (conferenceInfo.hasOwnProperty("silents")) {
                let silents = conferenceInfo["silents"];
                that.parsSilentsFromConferenceUpdatedEvent(conference, silents);
            }

            // publishers
            if (conferenceInfo.hasOwnProperty("publishers")) {
                let publishers = conferenceInfo["publishers"];
                await that.parsePublishersFromConferenceUpdatedEvent(conference, publishers, true);
            }

            // added-publishers
            if (conferenceInfo.hasOwnProperty("added-publishers")) {
                let addedPublishers = conferenceInfo["added-publishers"];
                let addedPublishersIdList: List<string> = that.parseIdFromConferenceUpdatedEvent(addedPublishers, "publisher");
                updatedDatasForEvent["added-publishers"] = addedPublishersIdList;
                await that.parsePublishersFromConferenceUpdatedEvent(conference, addedPublishers, true);
            }

            // removed-publishers
            if (conferenceInfo.hasOwnProperty("removed-publishers")) {
                let removedPublishers = conferenceInfo["removed-publishers"];
                let removedPublishersIdList: List<string> = that.parseIdFromConferenceUpdatedEvent(removedPublishers, "publisher");
                updatedDatasForEvent["removed-publishers"] = removedPublishersIdList;
                await that.parsePublishersFromConferenceUpdatedEvent(conference, removedPublishers, false);
            }

            // services
            if (conferenceInfo.hasOwnProperty("services")) {
                let services = conferenceInfo["services"];
                await that.parseServicesFromConferenceUpdatedEvent(conference, services, false);
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", conference : ", conference);

            if (amIRemoved) {
                that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) id : ", id, ", " + ", conference : ", conference, " i am removed from conference, so reset the conference.");
                conference.reset();
            }

            // Finally add conference to the cache
            await this._bubbleService.addOrUpdateConferenceToCache(conference, updatedDatasForEvent);

            // */
        } else {
            that._logger.log(that.INTERNAL, LOG_ID + "(parseConferenceV2UpdatedEvent) xmlnsNode is not jabber:iq:conference:2 id : ", id);
        }
    }

    async onMessageReceived(msg, stanzaTab: Element) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            if (jsonStanza?.message['$attrs'].type == "chat" || jsonStanza?.message['$attrs'].type == "groupchat") {
                return;
            }
            //that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) _entering_ : ", msg, "\n", prettyStanza);
            that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) jsonStanza : ", jsonStanza);
            /*jsonStanza :  {
              message: {
                '$attrs': {
                  xmlns: 'jabber:client',
                  'xml:lang': 'en',
                  to: 'adcf613d42984a79a7bebccc80c2b65e@openrainbow.net',
                  from: 'adcf613d42984a79a7bebccc80c2b65e@openrainbow.net/node_ciBHlrJd',
                  id: 'node_e126e64f-edcd-4fbf-90d9-665c0796c5545'
                },
                voiceMail: {
                  '$attrs': {
                    xmlns: 'jabber:iq:voicemailTranscription',
                    jid: 'adcf613d42984a79a7bebccc80c2b65e@openrainbow.net',
                    date: '2025-05-07T09:28:48.594Z',
                    duration: 145,
                    fileDescId: 'fileid1234',
                    fromNumber: 'from',
                    transcript: 'Une chouette transcription de mon message'
                  }
                }
              }
            }
            // */
            let voiceMailJson = jsonStanza?.message?.voiceMail;
            that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) id : voiceMailJson : ", voiceMailJson);
            if (voiceMailJson) {
                let voiceMailReceived = {
                    jid: voiceMailJson['$attrs'].jid,
                    date: voiceMailJson['$attrs'].date,
                    duration: voiceMailJson['$attrs'].duration,
                    // peerType: jsonStanza?.message['$attrs'].type,
                    fileDescId: voiceMailJson['$attrs'].fileDescId,
                    fromNumber: voiceMailJson['$attrs'].fromNumber,
                    transcript: voiceMailJson['$attrs'].transcript,
                };
                that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) voiceMailReceived : ", voiceMailReceived);
                that.eventEmitter.emit("evt_internal_voicemailreceived", voiceMailReceived);
            }
        } catch (err) {
            //that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! : ", err);
        }
    }

    async onChatMessageReceived(msg, stanzaTab: Element) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) _entering_ : ", msg, "\n", prettyStanza);
            let content = "";
            let lang = "";
            let alternativeContent: Array<{ "message": string, "type": string }> = [];
            let subject = "";
            let eventName = undefined;
            let roomid = "";
            let pollid = "";
            let questions = undefined;
            let eventJid = "";
            let userIdEvent = "";
            let hasATextMessage = false;
            let oob = null;
            let geoloc = null;
            let messageType = stanza.attrs.type;
            let timestamp = new Date();
            let replaceMessageId = null;
            let deletedMsg = false;
            let modifiedMsg = false;
            let attention = false;
            let confOwnerId = null;
            let confOwnerDisplayName = null;
            let confOwnerJid = null;
            let conference = false;
            let conferencebubbleId = undefined;
            let conferencebubbleJid = undefined;
            let answeredMsgId = undefined;
            let answeredMsgStamp = undefined;
            let answeredMsgDate = undefined;
            let urgency = "std";
            let urgencyAck: boolean = false;
            let urgencyHandler: any = undefined;
            let voiceMessage = undefined;
            let isForwarded: boolean = false;
            let forwardedMsg: any = undefined;
            let historyIndex: string;
            let attachedMsgId: string;
            let attachIndex: number;
            let attachNumber: number;

            let fromJid = xu.getBareJIDFromFullJID(stanza.attrs.from);
            let resource = xu.getResourceFromFullJID(stanza.attrs.from);
            let toJid = stanza.attrs.to;
            let id = stanza.attrs.id;
            let children = stanza.children;

            let mentions = [];

            let rainbowCpaas = undefined;
            let datastoretypeOfMsg : DataStoreType = DataStoreType.StoreTwinSide;

            voiceMessage = stanza.find("voicemessage").text();
            historyIndex = id;
            for (const node of children) {
                switch (node.getName()) {
                    case "sent":
                        if (node.attrs.xmlns==="urn:xmpp:carbons:2") {
                            that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - CC message 'sent' received");
                            let forwarded = node.children[0];
                            if (forwarded && forwarded.getName()==="forwarded") {
                                let message = forwarded.children[0];
                                if (message && message.getName()==="message") {
                                    fromJid = xu.getBareJIDFromFullJID(message.attrs.from);
                                    resource = xu.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    let childs = message.children;
                                    if (childs) {
                                        let timestamp = message.getChildren("archived").length &&
                                        message.getChildren("archived")[0] &&
                                        message.getChildren("archived")[0].attrs.stamp ?
                                                new Date(message.getChildren("archived")[0].attrs.stamp):new Date();

                                        let answeredMsgId = stanza.find("answeredMsg").text();
                                        let answeredMsgStamp = undefined;
                                        let answeredMsgDate = undefined;
                                        if (answeredMsgId) {
                                            answeredMsgStamp = stanza.find("answeredMsg").attrs["stamp"];
                                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString():undefined;
                                        }
                                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ",message - CC message  answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

                                        let nodeX = stanza.find("x");
                                        let xmlns = nodeX.attrs.xmlns;
                                        switch (xmlns) {
                                            case "jabber:x:bubble:conference":
                                            case "jabber:x:conference:2":
                                            case "jabber:x:conference": {
                                                conference = true;
                                                conferencebubbleId = nodeX.attrs.thread;
                                                conferencebubbleJid = nodeX.attrs.jid;
                                                that._logger.log("debug", LOG_ID + "(onChatMessageReceived) id : ", id, ", conference received");
                                            }
                                                break;
                                            case "jabber:x:oob" : {
                                                attachIndex = nodeX.attrs.index;
                                                attachNumber = nodeX.attrs.count;
                                                let urlFile = nodeX.getChild("url").getText();
                                                let fileId = urlFile ? urlFile.split(/[/ ]+/).pop():"";
                                                oob = {
                                                    url: urlFile,
                                                    mime: nodeX.getChild("mime").getText(),
                                                    filename: nodeX.getChild("filename").getText(),
                                                    filesize: nodeX.getChild("size").getText(),
                                                    fileId: fileId
                                                };
                                                that._logger.log("debug", LOG_ID + "(onChatMessageReceived) id : ", id, ", oob received");
                                                break;
                                            }
                                            default:
                                                break;
                                        }

                                            childs.forEach(async (nodeChild) => {
                                            if (nodeChild.getName()==="body") {
                                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - CC message 'sent' of type chat received ");

                                                let data = {
                                                    "fromJid": fromJid,
                                                    "resource": resource,
                                                    "toJid": toJid,
                                                    "type": messageType,
                                                    "content": nodeChild.getText(),
                                                    "id": id,
                                                    "lang": nodeChild.attrs["xml:lang"],
                                                    "cc": true,
                                                    "cctype": "sent",
                                                    "isEvent": false,
                                                    "date": timestamp,
                                                    "answeredMsg": undefined,
                                                    "answeredMsgId": answeredMsgId,
                                                    "answeredMsgDate": answeredMsgDate,
                                                    "answeredMsgStamp": answeredMsgStamp
                                                };

                                                let conversationId = data.toJid;

                                                if (answeredMsgId) {
                                                    //that._logger.log(that.DEBUG, LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                                                    if (conversationId) {
                                                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversationId, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                                                        if (data.answeredMsg) {
                                                            data.answeredMsg.conversation = await that._conversationService.getConversationById(conversationId);
                                                        }
                                                    }
                                                }

                                                //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, Message.Side.LEFT, data.content, null, data.answeredMsg, data.answeredMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.isMarkdown, data.subject, data.attention, data.geoloc, data.alternativeContent);
                                                let dataMessage: Message = await Message.create(
                                                        null,
                                                        null,
                                                        data.id,
                                                        data.type,
                                                        data.date,
                                                        data.fromJid,
                                                        Message.Side.RIGHT,
                                                        null,
                                                        Message.ReceiptStatus.NONE,
                                                        undefined, // data.isMarkdown,
                                                        undefined, // data.subject,
                                                        undefined, // data.geoloc,
                                                        undefined, // data.voiceMessage,
                                                        undefined, // data.alternativeContent,
                                                        undefined, // data.attention,
                                                        undefined, // data.mentions,
                                                        undefined, // data.urgency,
                                                        undefined, // data.urgencyAck,
                                                        undefined, // data.urgencyHandler,
                                                        //data.translatedText,
                                                        //data.isMerged,
                                                        undefined, // data.historyIndex,
                                                        //data.showCorrectedMessages,
                                                        //data.replaceMsgs,
                                                        undefined, // data.attachedMsgId,
                                                        undefined, // data.attachIndex,
                                                        undefined, // data.attachNumber,
                                                        data.resource,
                                                        data.toJid,
                                                        data.content,
                                                        data.lang,
                                                        data.cc,
                                                        data.cctype,
                                                        data.isEvent,
                                                        undefined, // data.event,
                                                        oob, // data.oob,
                                                        undefined, // data.fromBubbleJid,
                                                        undefined, // data.fromBubbleUserJid,
                                                        data.answeredMsg,
                                                        data.answeredMsgId,
                                                        data.answeredMsgDate,
                                                        data.answeredMsgStamp,
                                                        undefined,//data.eventJid,
                                                        undefined, // data.originalMessageReplaced,
                                                        undefined, // data.confOwnerId,
                                                        undefined, // data.confOwnerDisplayName,
                                                        undefined, // data.confOwnerJid,
                                                        false, // data.isForwarded,
                                                        undefined, // data.forwardedMsg
                                                );
                                                //that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) with dataMessage Message : ", dataMessage);
                                                dataMessage.updateMessage(data);
                                                //that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) with dataMessage updated Message : ", dataMessage);


                                                that._onMessageReceived(conversationId, dataMessage);

                                            }
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    case "received":
                        if (node.attrs.xmlns==="urn:xmpp:carbons:2") {
                            that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - CC message 'received' received");
                            let forwarded = node.children[0];
                            if (forwarded && forwarded.getName()==="forwarded") {
                                let message = forwarded.children[0];
                                if (message && message.getName()==="message") {
                                    fromJid = xu.getBareJIDFromFullJID(message.attrs.from);
                                    resource = xu.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    let childs = message.children;
                                    if (childs) {
                                        let timestamp = message.getChildren("archived").length &&
                                        message.getChildren("archived")[0] &&
                                        message.getChildren("archived")[0].attrs.stamp ?
                                                new Date(message.getChildren("archived")[0].attrs.stamp):new Date();

                                        let answeredMsgId = stanza.find("answeredMsg").text();
                                        let answeredMsgStamp = undefined;
                                        let answeredMsgDate = undefined;
                                        if (answeredMsgId) {
                                            answeredMsgStamp = stanza.find("answeredMsg").attrs["stamp"];
                                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString():undefined;
                                        }
                                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) message - CC message  answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

                                        childs.forEach(async function (nodeChild) {
                                            if (nodeChild.getName()==="body") {
                                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - CC message 'sent' of type chat received ");

                                                let data = {
                                                    "fromJid": fromJid,
                                                    "resource": resource,
                                                    "toJid": toJid,
                                                    "type": messageType,
                                                    "content": nodeChild.getText(),
                                                    "id": id,
                                                    "lang": nodeChild.attrs["xml:lang"],
                                                    "cc": true,
                                                    "cctype": "sent",
                                                    "isEvent": false,
                                                    "date": timestamp,
                                                    "answeredMsg": undefined,
                                                    "answeredMsgId": answeredMsgId,
                                                    "answeredMsgDate": answeredMsgDate,
                                                    "answeredMsgStamp": answeredMsgStamp
                                                };

                                                let conversationId = data.fromJid;

                                                if (answeredMsgId) {
                                                    //that._logger.log(that.DEBUG, LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                                                    if (conversationId) {
                                                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversationId, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                                                        if (data.answeredMsg) {
                                                            data.answeredMsg.conversation = await that._conversationService.getConversationById(conversationId);
                                                        }
                                                    }
                                                }

                                                that._onMessageReceived(conversationId, data);
                                            }
                                            if (nodeChild.getName()==="conference-info" && nodeChild.attrs.xmlns==="jabber:iq:conference:2") {
                                                that.parseConferenceV2UpdatedEvent(stanza, id, nodeChild);
                                            }
                                        });
                                    }
                                }
                            }
                        } else {
                            let receipt = {
                                event: node.attrs.event,
                                entity: node.attrs.entity,
                                type: messageType,
                                id: node.attrs.id,
                                fromJid: fromJid,
                                resource: resource
                            };
                            that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - receipt received");
                            that.eventEmitter.emit("evt_internal_onreceipt", receipt);
                        }
                        break;
                    case "active":
                    case "inactive":
                    case "composing":
                    case "paused":
                        let chatstate = {
                            type: messageType,
                            fromJid: fromJid,
                            resource: resource,
                            chatstate: node.getName()
                        };
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - someone is " + node.getName());
                        that.eventEmitter.emit("evt_internal_chatstate", chatstate);
                        break;
                    case "pin":
                        let pinJson = jsonStanza?.message?.pin;
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", pinJson : ", pinJson);
                        let pinManaged = {
                            pinId: pinJson['$attrs'].id,
                            action: pinJson['$attrs'].action,
                            peerId: pinJson['$attrs'].peerId,
                            peerType: jsonStanza?.message['$attrs'].type,
                            peerPinId: pinJson['$attrs'].peerPinId,
                            ownerId: pinJson['$attrs'].ownerId,
                            ownerPinId: pinJson['$attrs'].ownerPinId,
                            content: pinJson.content?._?pinJson.content?._:pinJson.content
                        };
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", pinManaged : ", pinManaged);
                        that.eventEmitter.emit("evt_internal_pinmanagement", pinManaged);
                        break;
                    case "archived":
                        break;
                    case "stanza-id":
                        break;
                    case "subject":
                        subject = node.getText();
                        hasATextMessage = hasATextMessage || (!(!subject || subject===''));
                        break;
                    case "event":
                        eventName = node.attrs.name;
                        eventJid = node.attrs.jid;
                        userIdEvent = node.attrs["user-id"];
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", eventName : ", eventName,", eventJid : ", eventJid, ", userIdEvent : ", userIdEvent);
                        break;
                        break;
                    case "room-id":
                        roomid = node.getText();
                        break;
                    case "poll-id":
                        pollid = node.getText();
                        break;
                    case "poll-info":
                        roomid = node.find("room-id").text();
                        pollid = node.attrs["id"];
                        //<room-name>A bubble for pollData</room-name>
                        break;
                    case "questions":
                        let xmlNodeStr = node ? node.toString():"<xml></xml>";
                        questions = await getJsonFromXML(xmlNodeStr);
                        break;
                    case "body":
                        content = node.getText();
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - content : ", "***");
                        if (node.attrs["xml:lang"]) { // in <body>
                            lang = node.attrs["xml:lang"];
                        } else if (node.parent.attrs["xml:lang"]) { // in <message>
                            lang = node.parent.attrs["xml:lang"];
                        } else {
                            lang = "en";
                        }
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - lang : ", lang);
                        hasATextMessage = hasATextMessage || (!(!content || content===''));
                        break;
                    case "answeredMsg":
                        answeredMsgId = node.getText();
                        answeredMsgStamp = node.attrs["stamp"];
                        answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString():undefined;
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);
                        break;
                    case "content":
                        alternativeContent.push({
                            "message": node.getText(),
                            "type": node.getAttr("type")
                        });
                        hasATextMessage = true;
                        break;
                    case "attach-to":
                        if (node.attrs.xmlns==="urn:xmpp:message-attaching:1") {
                            attachedMsgId = node.attrs.id;
                        } else {
                            that._logger.log(that.WARN, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - unknown attachedMsgId : ", attachedMsgId);
                        }
                        break;
                    case "forwarded":
                        if (node.attrs.xmlns==="urn:xmpp:forward:0") {
                            isForwarded = true;
                            let msg = node.getChild("message");
                            forwardedMsg = {
                                "origMsgId": msg.attrs.id,
                                "fromJid": msg.attrs.from,
                                "to": msg.attrs.to,
                                "type": msg.attrs.type,
                                "body": msg.getChild("body").text(),
                                "lang": msg.getChild("body").attrs["xml:lang"]
                            };
                            that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - forwardedMsg : ", forwardedMsg);
                        }
                        break;
                    case "request":
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - asked for receipt");
                        // Acknowledge 'received'
                        let stanzaReceived = xml("message", {
                                    "to": fromJid,
                                    "from": toJid,
                                    "type": messageType
                                }, xml("received", {
                                    "xmlns": "urn:xmpp:receipts",
                                    "event": "received",
                                    "entity": "client",
                                    "id": stanza.attrs.id
                                })
                        );

                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ",  answered - send receipt 'received' : ", stanzaReceived.root().toString());
                        that.xmppClient.send(stanzaReceived);

                        //Acknowledge 'read'
                        if (that.xmppService.shouldSendReadReceipt || (messageType===TYPE_GROUPCHAT && xu.getResourceFromFullJID(stanza.attrs.from)===that.fullJid)) {

                            let stanzaRead = xml("message", {
                                        "to": fromJid,
                                        "from": toJid,
                                        "type": messageType
                                    }, xml("received", {
                                        "xmlns": "urn:xmpp:receipts",
                                        "event": "read",
                                        "entity": "client",
                                        "id": stanza.attrs.id
                                    })
                            );
                            that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", answered - send markAsRead : receipt 'read' : ", stanzaRead.root().toString());
                            that.xmppClient.send(stanzaRead);
                        }
                        break;
                    case "recording":
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - recording message");
                        // TODO
                        break;
                    case "timestamp":
                        timestamp = node.attrs.value ?
                                new Date(node.attrs.value):new Date();
                        break;
                    case "x": {
                        let xmlns = node.attrs.xmlns;
                        switch (xmlns) {
                            case "jabber:x:bubble:conference":
                            case "jabber:x:conference:2":
                            case "jabber:x:conference": {
                                conference = true;
                                conferencebubbleId = node.attrs.thread;
                                conferencebubbleJid = node.attrs.jid;
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference received");
                            }
                                break;
                            case "jabber:x:oob" : {
                                attachIndex = node.attrs.index;
                                attachNumber = node.attrs.count;
                                let urlFile = node.getChild("url").getText();
                                let fileId = urlFile ? urlFile.split(/[/ ]+/).pop():"";
                                oob = {
                                    url: urlFile,
                                    mime: node.getChild("mime").getText(),
                                    filename: node.getChild("filename").getText(),
                                    filesize: node.getChild("size").getText(),
                                    fileId: fileId
                                };
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", oob received");
                                break;
                            }
                            default:
                                break;
                        }
                        break;
                    }
                    case "y": {
                        let xmlns = node.attrs.xmlns;
                        switch (xmlns) {
                            case "jabber:y:owner":
                                confOwnerId = node.attrs.userid;
                                confOwnerDisplayName = node.attrs.displayname;
                                confOwnerJid = node.attrs.jid;
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", y owner received, y : ", node, ": confOwnerId : ", confOwnerId, ", confOwnerDisplayName : ", confOwnerDisplayName, " confOwnerJid : ", confOwnerJid);
                                break;
                            default:
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ",  y received");
                                break;
                        }
                        break;
                    }
                    case "no-store":
                        datastoretypeOfMsg = DataStoreType.NoStore;
                        break;
                    case "no-permanent-store":
                        datastoretypeOfMsg = DataStoreType.NoPermanentStore;
                        break;
                    case "store":
                        datastoretypeOfMsg = DataStoreType.Store;
                        break;
                    case "geoloc": {
                        let datum = node.find("datum").text();
                        let lat = node.find("lat").text();
                        let lon = node.find("lon").text();
                        let altitude = node.find("altitude").text();
                        geoloc = {
                            datum,
                            "latitude": lat,
                            "longitude": lon,
                            "altitude": altitude
                        };
                    }
                        break;
                    case "replace": {
                        let replacedId = node.attrs.id;
                        replaceMessageId = replacedId;
                    }
                        break;
                    case "delete": {
                        deletedMsg = true;
                    }
                        break;
                    case "modified": 
                    case "modify": {
                        modifiedMsg = true;
                    }
                        break;
                    case "deleted": {
                        let idDeleted = node.attrs.id;
                        let conversationJid = node.attrs.with;
                        if (idDeleted==="all") {
                            let conversation = that._conversationService.getConversationById(conversationJid);
                            if (conversation) {
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conversation with all messages deleted received ", conversation.id);
                                conversation.reset();
                                that.eventEmitter.emit("evt_internal_allmessagedremovedfromconversationreceived", conversation);
                            }
                        } else {
                            deletedMsg = true;
                        }
                    }
                        break;
                    case "mark_as_read": {
                        let conversationId = node.find("mark_as_read").attr("with");
                        let conversation = this._conversationService.getConversationById(conversationId);

                        if (conversation) {
                            let typeread = node.find("mark_as_read").attr("id");
                            switch (typeread) {
                                case "all-received": // messages for this conversation have been acknowledged
                                    conversation.missedCounter = 0;
                                    break;
                                case "all-sent": // messages for this conversation have been read
                                    // Not take into account : conversation.ackReadAllMessages();
                                    break;
                                default:
                                    that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) id : ", id, ", error - unknown read type : ", typeread);
                                    break;
                            }
                        }
                    }
                        break;
                    case "deleted_call_log":
                        break;
                    case "updated_call_log":
                        break;
                    case "attention":
                        attention = true;
                        break;
                    case "mention": {
                        // stanzaData.mentions = [];
                        const mentionJidElem = node.find("jid");
                        if (Array.isArray(mentionJidElem)) {
                            mentionJidElem.forEach((content) => {

                                const mention = {};
                                mention['jid'] = content.text();
                                mention['pos'] = parseInt(content.attr("pos"), 10);
                                mention['size'] = parseInt(content.attr("size"), 10);

                                if (mention['jid'] && mention['size']) {
                                    mentions.push(mention);
                                }
                                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - mention : ", mention);
                            });
                        } else {
                            const mention = {};
                            mention['jid'] = mentionJidElem.text();
                            mention['pos'] = parseInt(mentionJidElem.attr("pos"), 10);
                            mention['size'] = parseInt(mentionJidElem.attr("size"), 10);

                            if (mention['jid'] && mention['size']) {
                                mentions.push(mention);
                            }
                            that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - mention : ", mention);
                        }
                    }
                        break;
                    case "headers": {
                        const headersElem = node.find("headers");
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
                    }
                        break;
                    case "conference-info": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - conference-info : ", node);
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference-info : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);

                        let ignoreConferenceInfo = false;

                        let xmlNodeStr = node ? node.toString():"<xml></xml>";
                        let jsonNode = await getJsonFromXML(xmlNodeStr);
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", JSON conference-info : ", "\n", jsonNode);
                        let conferenceInfo = jsonNode["conference-info"];
                        //that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) conferenceInfo : ", conferenceInfo);
//                        let bubble = undefined;

                        let xmlnsNode = conferenceInfo["$attrs"]["xmlns"];
                        if (xmlnsNode=="jabber:iq:conference" && !ignoreConferenceInfo) {
                            let conferenceId = undefined;
                            if (conferenceInfo.hasOwnProperty("conference-id")) {
                                conferenceId = conferenceInfo["conference-id"];
                            }

                            that._logger.log(that.WARN, LOG_ID + "(onChatMessageReceived) id : ", id, ", an old event of conference V1 conference-info received JSON conference-info : ", "\n", jsonNode);
                        } else {

                        }

                        if (xmlnsNode=="jabber:iq:conference:2" && !ignoreConferenceInfo) {
                            await that.parseConferenceV2UpdatedEvent(stanza, id, node);

                            let conferenceId = undefined;
                            if (conferenceInfo.hasOwnProperty("conference-id")) {
                                conferenceId = conferenceInfo["conference-id"];
                            }
                            let webConferenceSession: WebConferenceSession = null;

                            let stanzaElem = node;

                        } else {

                        }

                    }
                        break;
                    case "discover": {
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) discover to : ", fromJid);

                        let msg = xml("message", {
                            "from": that.fullJid,
                            //"from": to,
                            "to": fromJid ? fromJid : that.jid_im,
                            "id": stanza.attrs.id
                            //"xmlns" : "jabber:iq:http"
                        });

                        let stanzaReq = xml("resource", {xmlns: NameSpacesLabels.XmppHttpNS, "version" : "1.1"}, that.resourceId);
                        msg.append(stanzaReq, undefined);

                        //that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", discover - msg : ", msg);

                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", discover - send result : ", stanzaReq.root().toString());
                        await that.xmppClient.send(msg);

                        break;
                    }
                    case "rainbow-cpaas": {
                        let xmlNodeStr = node ? node.toString():"<xml></xml>";
                        let jsonNode = await getJsonFromXML(xmlNodeStr);
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", JSON rainbow-cpaas : ", "\n", jsonNode);
                        rainbowCpaas = jsonNode["rainbow-cpaas"];
                        delete rainbowCpaas["$attrs"];
                        that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", JSON rainbow-cpaas : ", "\n", rainbowCpaas);
                        break;
                    }
                    default:
                        that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) id : ", id, ", unmanaged chat message node : ", node.getName());
                        that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) id : ", id, ", unmanaged chat message node : ", node.getName(), "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
                        break;
                }
            }

            switch (eventName) {
                case "invitation": {
                    if (eventJid && eventJid != that.jid_im) {
                        let invitation = {
                            event: "invitation",
                            contact_jid: eventJid,
                            bubbleJid: fromJid,
                            fromJid: fromJid,
                            resource: resource,
                            content,
                            subject
                        };
                        //let contact = await that._contactsService.getContactByJid(eventJid);
                        //that._logger.log(that.INFO, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference invitation received for somebody else contact : ", contact?contact.id:"", ",\n  content (=body) : ", content, ", subject : ", subject);
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference invitation received for somebody else,\n  content (=body) : ", content, ", subject : ", subject);
                        that.eventEmitter.emit("evt_internal_contactinvitationreceived", invitation);
                    } else {
                        let invitation = {
                            event: "invitation",
                            bubbleId: conferencebubbleId,
                            bubbleJid: conferencebubbleJid,
                            fromJid: fromJid,
                            resource: resource
                        };
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference invitation received");
                        that.eventEmitter.emit("evt_internal_invitationreceived", invitation);
                    }
                }
                    break;
                case "conferenceAdd": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference start received");
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestartedreceived", bubble);
                }
                    break;
                case "conferenceRemove": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference stop received");
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestoppedreceived", bubble);
                }
                    break;
                case "conferenceDelegate": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference delegate received, userIdEvent : ", userIdEvent);
                    if (!conferencebubbleJid) {
                        conferencebubbleJid = fromJid;
                    }
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true).catch((error) => {
                        that._logger.log(that.WARN, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference delegate received,issue getting bubble, conferencebubbleJid : ", conferencebubbleJid);
                    });
                    that.eventEmitter.emit("evt_internal_bubbleconferencedelegatereceived", bubble, userIdEvent);
                }
                    break;
                case "startConference": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference start received");
                    conferencebubbleJid = fromJid;
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestartedreceived", bubble);
                }
                    break;
                case "stopConference": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", conference stop received");
                    conferencebubbleJid = fromJid;
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestoppedreceived", bubble);
                }
                    break;
                case "pollUnpublish": 
                case "pollTerminate": 
                case "pollPublish": 
                case "pollDelete":
                case "pollVote": {
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", poll event received : ", eventName);
                    let obj = {
                        roomid,
                        pollid,
                        questions,
                        event : eventName
                    }
                    that.eventEmitter.emit("evt_internal_bubblepollevent", obj);
                }
                    break;
                case undefined: {
                    //that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", not an eventName for msg : " , msg);
                }
                    break;
                default:
                    that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) id : ", id, ", no treatment of event ", msg, ", eventName : ", eventName, " : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza, " so default."); //, this.eventEmitter
            }

            let fromBubbleJid = "";
            let fromBubbleUserJid = "";
            if (stanza.attrs.type===TYPE_GROUPCHAT) {
                fromBubbleJid = xu.getBareJIDFromFullJID(stanza.attrs.from);
                fromBubbleUserJid = xu.getResourceFromFullJID(stanza.attrs.from);
                resource = xu.getResourceFromFullJID(fromBubbleUserJid);
            }

            if ((messageType===TYPE_GROUPCHAT && fromBubbleUserJid!==that.fullJid) || (messageType===TYPE_CHAT && fromJid!==that.fullJid)) {
                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", message - chat message received");

                timestamp = stanza.getChildren("archived").length &&
                stanza.getChildren("archived")[0] &&
                stanza.getChildren("archived")[0].attrs.stamp ?
                        new Date(stanza.getChildren("archived")[0].attrs.stamp):new Date();

                //Message.create(stanza.attrs.id,timestamp,fromJid,)

                let data = {
                    "fromJid": fromJid,
                    "resource": resource,
                    "toJid": toJid,
                    "type": messageType,
                    "content": content,
                    "alternativeContent": alternativeContent,
                    "id": stanza.attrs.id,
                    "lang": lang,
                    "cc": false,
                    "cctype": "",
                    "isEvent": false,
                    "oob": oob,
                    "geoloc": geoloc,
                    "voiceMessage": voiceMessage,
                    "date": timestamp,
                    "fromBubbleJid": null,
                    "fromBubbleUserJid": null,
                    "event": null,
                    "eventJid": null,
                    "originalMessageReplaced": null,
                    "attention": undefined,
                    subject,
                    "confOwnerId": undefined,
                    "confOwnerDisplayName": undefined,
                    "confOwnerJid": undefined,
                    "answeredMsg": undefined,
                    "answeredMsgId": answeredMsgId,
                    "answeredMsgDate": answeredMsgDate,
                    "answeredMsgStamp": answeredMsgStamp,
                    urgency,
                    urgencyAck,
                    urgencyHandler,
                    "isMarkdown": false,
                    mentions,
                    isForwarded,
                    forwardedMsg,
                    historyIndex,
                    attachedMsgId,
                    attachIndex,
                    attachNumber,
                    deleted : false,
                    modified : false,
                    rainbowCpaas,
                    datastoretypeOfMsg
                };

                if (eventName) {
                    data.event = eventName;
                    data.eventJid = eventJid;
                    data.isEvent = true;
                }

                if (stanza.attrs.type===TYPE_GROUPCHAT ) {
                    data.fromBubbleJid = fromBubbleJid;
                    data.fromBubbleUserJid = fromBubbleUserJid;
                    data.fromJid = xu.getRoomJIDFromFullJID(stanza.attrs.from);

                    if (attention) {
                        data.attention = attention;
                    }

                    if (mentions.length > 0) {
                        data.mentions = mentions;
                    }
                    if (confOwnerId) {
                        data.confOwnerId = confOwnerId;
                    }
                    if (confOwnerDisplayName) {
                        data.confOwnerDisplayName = confOwnerDisplayName;
                    }
                    if (confOwnerJid) {
                        data.confOwnerJid = confOwnerJid;
                    }

                }

                let outgoingMessage = that._contactsService.isUserContactJid(fromJid);
                let conversationId = outgoingMessage ? data.toJid:(stanza.attrs.type===TYPE_GROUPCHAT ? fromBubbleJid:data.fromJid);

                if (answeredMsgId) {

                    let conversation = that._conversationService.getConversationById(conversationId);
                    that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                    if (conversation) {
                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                        if (data.answeredMsg) {
                            data.answeredMsg.conversation = conversation;
                        }
                    }
                }

                if (replaceMessageId) {
                    //data.replaceMessageId = replaceMessageId;
                    let conversation = that._conversationService.getConversationById(conversationId);
                    if (conversation) {
                        data.originalMessageReplaced = conversation.getMessageById(replaceMessageId);
                    } else {
                        that._logger.log(that.WARN, LOG_ID + "(onChatMessageReceived) id : ", id, ", This is a replace msg but no conversation found for the original msg id. So store an empty msg to avoid the lost of information.", replaceMessageId);
                        data.originalMessageReplaced = {};
                        data.originalMessageReplaced.id = replaceMessageId;
                    }
                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) id : ", id, ", This is a replace msg, so set data.originalMessageReplaced.replacedByMessage : ", replaceMessageId);
                    data.originalMessageReplaced.replacedByMessage = data;
                } else {
                    if (!hasATextMessage && !isForwarded && !deletedMsg && !modifiedMsg && !rainbowCpaas) {
                        that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) id : ", id, ", with No message text, so ignore it! hasATextMessage : ", hasATextMessage);
                        return;
                    } else {
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) with message : ", data, ", hasATextMessage : ", hasATextMessage);
                    }
                }

                if (deletedMsg) {
                    data.deleted = true;
                }
                
                if (modifiedMsg) {
                    data.modified = true;
                }
                
                data.isMarkdown = false;
                if (data.alternativeContent && data.alternativeContent.length > 0) {
                    data.isMarkdown = (data.alternativeContent[0]).type==="text/markdown";
                }

                if (rainbowCpaas) {

                    let dataRainbowCpaas = {
                        "fromJid": data.fromJid,
                        "resource": data.resource,
                        "toJid": data.toJid,
                        "type": messageType,
                        "id": stanza.attrs.id,
                        "lang": lang,
                        "date": timestamp,
                        "fromBubbleJid": null,
                        "rainbowCpaas": data.rainbowCpaas
                    };

                    if (stanza.attrs.type===TYPE_CHAT) {

                    }
                    if (stanza.attrs.type===TYPE_GROUPCHAT) {
                        dataRainbowCpaas["fromBubbleJid"] = data.fromJid;
                    }

                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) with dataRainbowCpaas : ", dataRainbowCpaas);
                    that.eventEmitter.emit("evt_internal_rainbowcpaasreceived", dataRainbowCpaas);
                } else {

                    //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, data.side, data.content, null, data.answeredMsg, data.answererdMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.);
                    //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, Message.Side.LEFT, data.content, null, data.answeredMsg, data.answeredMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.isMarkdown, data.subject, data.attention, data.geoloc, data.alternativeContent);
                    let dataMessage: Message = await Message.create(
                        null,
                        null,
                        data.id,
                        data.type,
                        data.date,
                        data.fromJid,
                        Message.Side.LEFT,
                        null,
                        Message.ReceiptStatus.NONE,
                        data.isMarkdown,
                        data.subject,
                        data.geoloc,
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
                        data.eventJid,
                        data.originalMessageReplaced,
                        data.confOwnerId,
                        data.confOwnerDisplayName,
                        data.confOwnerJid,
                        data.isForwarded,
                        data.forwardedMsg,
                        data.deleted,
                        data.modified,
                        data.rainbowCpaas,
                        data.datastoretypeOfMsg
                    );
                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) with dataMessage Message : ", dataMessage);
                    dataMessage.updateMessage(data);
                    that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) with dataMessage updated Message : ", dataMessage);

                    await that._onMessageReceived(conversationId, dataMessage);
                    //that._onMessageReceived(conversationId, data);
                }
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it.");
                that._logger.log(that.INTERNAL, LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
            }
        } catch (err) {
            //that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onChatMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async parseParticipantsFromConferenceUpdatedEvent(conference: ConferenceSession, addedParticipants) {
        let that = this;
        if (addedParticipants!=null) {
            let participants: List<Participant> = conference.participants;
            if (participants==null)
                participants = new List<Participant>();

            let participant: Participant;
            let participantId: string;

            if (Array.isArray(addedParticipants.participant)) {
                for (let i = 0; i < addedParticipants.participant.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseParticipantsFromConferenceUpdatedEvent) addedParticipants iter index : ", i);
                    //for (const [key, value] of Object.entries(addedParticipants.participant[i])) {
                    let participantElem = addedParticipants.participant[i];
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseParticipantsFromConferenceUpdatedEvent) participantElem : ", participantElem);
                    //  let participantElem = value;
                    if (participantElem.hasOwnProperty("participant-id")) {
                        participantId = participantElem["participant-id"];
                    }
                    if (participantElem.hasOwnProperty("user-id")) {
                        participantId = participantElem["user-id"];
                    }
                    if (participantId) {
                        
                        // Get participant (if any)
                        participant = null;
                        participants.forEach((p: Participant) => {
                            //foreach ( p : Participant in participants)
                            //{
                            if (p.id==participantId) {
                                // Store it
                                participant = p;

                                // Remove from the list
                                participants.remove((item: Participant) => {
                                    return p.id===item.id;
                                });
                            }
                        });

                        // Create new one if not found
                        if (participant==null) {
                            participant = new Participant(participantId);
                        }

                        if (participantElem.hasOwnProperty("jid-im")) {
                            participant.jid_im = participantElem["jid-im"];
                            participant.contact = await that._contactsService.getContactByJid(participant.jid_im);
                        } else if (participantElem.hasOwnProperty("user-id")) {
                            participant.contact = await that._contactsService.getContactById(participantId);
                        }

                        if (participantElem.hasOwnProperty("phone-number"))
                            participant.phoneNumber = participantElem["phone-number"];

                        if (participantElem.hasOwnProperty("role"))
                            participant.moderator = (participantElem["role"]=="moderator");

                        if (participantElem.hasOwnProperty("mute"))
                            participant.muted = (participantElem["mute"]=="on") || (participantElem["mute"]=="true");

                        if (participantElem.hasOwnProperty("hold"))
                            participant.hold = (participantElem["hold"]=="on") || (participantElem["hold"]=="true");

                        if (participantElem.hasOwnProperty("delegate-capability"))
                            participant.delegateCapability = (participantElem["delegate-capability"]=="on") || (participantElem["delegate-capability"]=="true");

                        if (participantElem.hasOwnProperty("microphone"))
                            participant.microphone = (participantElem["microphone"]=="on") || (participantElem["microphone"]=="true");

                        if (participantElem.hasOwnProperty("talking-time"))
                            participant.talkingTime = parseInt(participantElem["talking-time"]);

                        if (participantElem.hasOwnProperty("cnx-state"))
                            participant.connected = (participantElem["cnx-state"]=="connected");

                        // Finally add the particpant
                        participants.add(participant);
                    }
                    //}

                    // Finally update Participants list from conference object
                    conference.participants = participants;
                }
            } else {
                //XmlElement element;
                //foreach (XmlNode node in addedParticipants)
                //for (let i = 0; i < addedParticipants.length; i++) {
                //  const participantElem = addedParticipants[i];
                //addedParticipants.each((__index: number, participantElem: any) => {
                for (const [key, value] of Object.entries(addedParticipants)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseParticipantsFromConferenceUpdatedEvent) property of Object : key : ", key ,", value : ", value);
                    let participantElem = value;
                    if (participantElem.hasOwnProperty("participant-id")) {
                        participantId = participantElem["participant-id"];
                    }
                    if (participantElem.hasOwnProperty("user-id")) {
                        participantId = participantElem["user-id"];
                    }
                    if (participantId) {

                        // Get participant (if any)
                        participant = null;
                        participants.forEach((p: Participant) => {
                            //foreach ( p : Participant in participants)
                            //{
                            if (p.id==participantId) {
                                // Store it
                                participant = p;

                                // Remove from the list
                                participants.remove((item: Participant) => {
                                    return p.id===item.id;
                                });
                            }
                        });

                        // Create new one if not found
                        if (participant==null) {
                            participant = new Participant(participantId);
                        }

                        if (participantElem.hasOwnProperty("jid-im")) {
                            participant.jid_im = participantElem["jid-im"];
                            participant.contact = await that._contactsService.getContactByJid(participant.jid_im);
                        } else if (participantElem.hasOwnProperty("user-id")) {
                            participant.contact = await that._contactsService.getContactById(participantId);
                        }

                        if (participantElem.hasOwnProperty("phone-number"))
                            participant.phoneNumber = participantElem["phone-number"];

                        if (participantElem.hasOwnProperty("role"))
                            participant.moderator = (participantElem["role"]=="moderator");

                        if (participantElem.hasOwnProperty("mute"))
                            participant.muted = (participantElem["mute"]=="on") || (participantElem["mute"]=="true");

                        if (participantElem.hasOwnProperty("hold"))
                            participant.hold = (participantElem["hold"]=="on") || (participantElem["hold"]=="true");

                        if (participantElem.hasOwnProperty("delegate-capability"))
                            participant.delegateCapability = (participantElem["delegate-capability"]=="on") || (participantElem["delegate-capability"]=="true");

                        if (participantElem.hasOwnProperty("microphone"))
                            participant.microphone = (participantElem["microphone"]=="on") || (participantElem["microphone"]=="true");

                        if (participantElem.hasOwnProperty("talking"))
                            participant.talking = (participantElem["talking"]=="true");

                        if (participantElem.hasOwnProperty("talking-time"))
                            participant.talkingTime = parseInt(participantElem["talking-time"]);

                        if (participantElem.hasOwnProperty("cnx-state"))
                            participant.connected = (participantElem["cnx-state"]=="connected");

                        // Finally add the particpant
                        participants.add(participant);
                    }
                }

                // Finally update Participants list from conference object
                conference.participants = participants;
            }
        }
    }

    parseIdFromConferenceUpdatedEvent(participants, propertyToGet: string): List<string> {
        let that = this;
        let result: List<string> = new List<string>();
        if (participants!=null) {
            /*        
            if (Array.isArray(participants.participant)) {
                for (let i = 0; i < participants.participant.length; i++) {
                    for (const [key1, value1] of Object.entries(participants.participant[i])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parseParticipantsIdFromConferenceUpdatedEvent) Iter of Properties : ", key1 ,":", value1);
                        if (key1==="participant-id" || key1==="user-id") {
                            let participantId: any = value1;
                            that._logger.log(that.INTERNAL, LOG_ID + "(parseParticipantsIdFromConferenceUpdatedEvent) : add participant-id", participantId);
                            result.add(participantId);
                        }
                    }
                }
            } else { // */
            if (participants[propertyToGet]) {
                //for (let i = 0; i < participants.participant.length; i++) {
                    for (const [key1, value1] of Object.entries(participants[propertyToGet])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parseIdFromConferenceUpdatedEvent) propertyToGet : ", propertyToGet, ", Iter of Properties : ", key1 ,":", value1);
                        if (key1==="participant-id" || key1==="user-id") {
                            let participantId: any = value1;
                            that._logger.log(that.INTERNAL, LOG_ID + "(parseIdFromConferenceUpdatedEvent) : add participant-id", participantId);
                            result.add(participantId);
                        }
                    }
                //}
            } else {
                    for (const [key1, value1] of Object.entries(participants)) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parseIdFromConferenceUpdatedEvent) Iter of Properties : key : ", key1 ,", value :", value1);
                        if (key1==="participant-id" || key1==="user-id") {
                            let participantId: any = value1;
                            that._logger.log(that.INTERNAL, LOG_ID + "(parseIdFromConferenceUpdatedEvent) : add participant-id", participantId);
                            result.add(participantId);
                        }
                    }
            }
            /*
                let list = participants.GetElementsByTagName("participant-id");
                if (list != null)
            {
                XmlElement element;
            
                foreach (XmlNode node in list)
            {
                element = node as XmlElement;
                if (element == null)
                continue;
            
                // Add Participant Id
                result.add(element.InnerText);
            }
            }
            */
        }
        return result;
    }

    parseTalkersFromConferenceUpdatedEvent(conference: ConferenceSession, talkersElmt) {
        let that = this;
        if (talkersElmt!=null) {
            let participants: List<Participant> = conference.participants;
            if (participants==null)
                participants = new List<Participant>();
            let talkers: List<Talker> = new List<Talker>();
            let talker: Talker;
            let participantId: string;
            // Reset the conferenc talkers already existing.
            conference.talkers = new List<Talker>();

            if (Array.isArray(talkersElmt.talker)) {
                for (let i = 0; i < talkersElmt.talker.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseTalkersFromConferenceUpdatedEvent) addedParticipants iter index : ", i);
                    for (const [key, value] of Object.entries(talkersElmt.talker[i])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parseTalkersFromConferenceUpdatedEvent) property of Objects : key : ", key ,", value :", value);
                        let talkerElem = value;
                        if (talkerElem.hasOwnProperty("participant-id")) {
                            participantId = talkerElem["participant-id"];
                        }
                        if (talkerElem.hasOwnProperty("user-id")) {
                            participantId = talkerElem["user-id"];
                        }
                        if (participantId) {

                            // Get participant (if any)
                            let participant : Participant = null;
                            participants.forEach((p: Participant) => {
                                //foreach ( p : Participant in participants)
                                //{
                                if (p.id==participantId) {
                                    // Store it
                                    participant = p;

                                }
                            });

                            // Create new one if not found
                            if (talker==null) {
                                talker = new Talker(participant);
                            }

                            if (talkerElem.hasOwnProperty("talking-time"))
                                talker.talkingTime = parseInt(talkerElem["talking-time"]);

                            if (talkerElem.hasOwnProperty("publisher"))
                                talker.publisher = talkerElem["publisher"];

                            if (talkerElem.hasOwnProperty("simulcast"))
                                talker.simulcast = talkerElem["simulcast"];

                            // Finally add the particpant
                            talkers.add(talker);
                        }
                    }

                    // Finally update Participants list from conference object
                    conference.talkers = talkers;
                }
            } else {
                //XmlElement element;
                //foreach (XmlNode node in addedParticipants)
                //for (let i = 0; i < addedParticipants.length; i++) {
                //  const participantElem = addedParticipants[i];
                //addedParticipants.each((__index: number, participantElem: any) => {
                for (const [key, value] of Object.entries(talkersElmt)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseTalkersFromConferenceUpdatedEvent) property of Object : key : ", key ,", value :", value);
                    let talkerElem = value;
                    if (talkerElem.hasOwnProperty("participant-id")) {
                        participantId = talkerElem["participant-id"];
                    }
                    if (talkerElem.hasOwnProperty("user-id")) {
                        participantId = talkerElem["user-id"];
                    }
                    if (participantId) {


                        // Get participant (if any)
                        talker = null;
                        let participant : Participant = null;
                        participants.forEach((p: Participant) => {
                            //foreach ( p : Participant in participants)
                            //{
                            if (p.id==participantId) {
                                // Store it
                                participant = p;
                            }
                        });

                        // Create new one if not found
                        if (talker == null) {
                            talker = new Talker(participant);
                        }

                        if (talkerElem.hasOwnProperty("talking-time"))
                            talker.talkingTime = talkerElem["talking-time"];

                        if (talkerElem.hasOwnProperty("publisher"))
                            talker.publisher = talkerElem["publisher"];

                        if (talkerElem.hasOwnProperty("simulcast"))
                            talker.simulcast = talkerElem["simulcast"];

                        // Finally add the particpant
                        talkers.add(talker);
                    }
                }

                // Finally update Participants list from conference object
                conference.talkers = talkers;
            }
        } else {
            let talkers = new List<Talker>();
            conference.talkers = talkers;
        } // */
    }
    
    parsSilentsFromConferenceUpdatedEvent(conference: ConferenceSession, silentsElmt) {
        let that = this;
        if (silentsElmt!=null) {
            let participants: List<Participant> = conference.participants;
            if (participants==null)
                participants = new List<Participant>();
            let silents: List<Silent> = new List<Silent>();
            let silent: Silent;
            let participantId: string;

            // Reset the existing silents in conference.
            conference.silents = new List<Silent>();

            if (Array.isArray(silentsElmt.silent)) {
                for (let i = 0; i < silentsElmt.silent.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parsSilentsFromConferenceUpdatedEvent) addedParticipants iter index : ", i);
                    for (const [key, value] of Object.entries(silentsElmt.silent[i])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parsSilentsFromConferenceUpdatedEvent) property of Objects : key : ", key ,", value :", value);
                        let silentElem = value;
                        if (silentElem.hasOwnProperty("participant-id")) {
                            participantId = silentElem["participant-id"];
                        }
                        if (silentElem.hasOwnProperty("user-id")) {
                            participantId = silentElem["user-id"];
                        }
                        if (participantId) {

                                // Get participant (if any)
                            let participant : Participant = null;
                            participants.forEach((p: Participant) => {
                                //foreach ( p : Participant in participants)
                                //{
                                if (p.id==participantId) {
                                    // Store it
                                    participant = p;

                                }
                            });

                            // Create new one if not found
                            if (silent==null) {
                                silent = new Silent(participant);
                            }

                            if (silentElem.hasOwnProperty("talking-time"))
                                silent.talkingTime = silentElem["talking-time"];

                            if (silentElem.hasOwnProperty("publisher"))
                                silent.publisher = silentElem["publisher"];

                            if (silentElem.hasOwnProperty("simulcast"))
                                silent.simulcast = silentElem["simulcast"];

                            // Finally add the particpant
                            silents.add(silent);
                        }
                    }

                    // Finally update Participants list from conference object
                    conference.silents = silents;
                }
            } else {
                //XmlElement element;
                //foreach (XmlNode node in addedParticipants)
                //for (let i = 0; i < addedParticipants.length; i++) {
                //  const participantElem = addedParticipants[i];
                //addedParticipants.each((__index: number, participantElem: any) => {
                for (const [key, value] of Object.entries(silentsElmt)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parsSilentsFromConferenceUpdatedEvent) property of Object : key : ", key ,", value :", value);
                    let silentElem = value;
                    if (silentElem.hasOwnProperty("participant-id")) {
                        participantId = silentElem["participant-id"];
                    }
                    if (silentElem.hasOwnProperty("user-id")) {
                        participantId = silentElem["user-id"];
                    }
                    if (participantId) {

                        // Get participant (if any)
                        silent = null;
                        let participant : Participant = null;
                        participants.forEach((p: Participant) => {
                            //foreach ( p : Participant in participants)
                            //{
                            if (p.id==participantId) {
                                // Store it
                                participant = p;
                            }
                        });

                        // Create new one if not found
                        if (silent == null) {
                            silent = new Silent(participant);
                        }

                        if (silentElem.hasOwnProperty("talking-time"))
                            silent.talkingTime = silentElem["talking-time"];

                        if (silentElem.hasOwnProperty("publisher"))
                            silent.publisher = silentElem["publisher"];

                        if (silentElem.hasOwnProperty("simulcast"))
                            silent.simulcast = silentElem["simulcast"];

                        // Finally add the particpant
                        silents.add(silent);
                    }
                }

                // Finally update Participants list from conference object
                conference.silents = silents;
            }
        } else {
            let silents = new List<Silent>();
            conference.silents = silents;
        }
    }
    

    async parsePublishersFromConferenceUpdatedEvent(conference: ConferenceSession, xmlElementList, add: boolean) {
        let that = this;
        if (xmlElementList!=null) {
            let publishers: List<Publisher> = conference.publishers;
            if (publishers==null)
                publishers = new List<Publisher>();

            let publisher: Publisher;
            let publisherId: string;

            let participants: List<Participant> = conference.participants;
            if (participants==null)
                participants = new List<Participant>();

            if (Array.isArray(xmlElementList.publisher)) {
                for (let i = 0; i < xmlElementList.publisher.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parsePublishersFromConferenceUpdatedEvent) xmlElementList iter index : ", i);
                    //XmlElement element;
                    //foreach (XmlNode node in addedParticipants)
                    //for (let i = 0; i < addedParticipants.length; i++) {
                    //  const participantElem = addedParticipants[i];
                    //addedParticipants.each((__index: number, participantElem: any) => {
                    for (const [key, value] of Object.entries(xmlElementList.publisher[i])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parsePublishersFromConferenceUpdatedEvent) property of Objects : key : ", key ,", value :", value);
                        let publisherElem = value;
                        if (publisherElem["participant-id"]!=null || publisherElem["publisher-id"]!=null || publisherElem["user-id"]) {
                            publisherId = publisherElem["publisher-id"];
                            if (!publisherId) publisherId = publisherElem["participant-id"];
                            if (!publisherId) publisherId = publisherElem["user-id"];

                            // Get publisher (if any)
                            publisher = null;
                            publishers.forEach((p: Publisher) => {
                                //foreach ( p : Participant in participants)
                                //{
                                if (p.id==publisherId) {
                                    // Store it
                                    publisher = p;

                                    // Remove from the list
                                    publishers.remove((item: Publisher) => {
                                        return p.id===item.id;
                                    });
                                }
                            });

                            let participant : Participant = null;
                            participants.forEach((p: Participant) => {
                                if (p.id==publisherId) {
                                    // Store it
                                    participant = p;
                                }
                            });

                            if (add) {

                                // Create new one if not found
                                if (publisher==null) {
                                    publisher = new Publisher(publisherId);
                                }

                                publisher.participant = participant;

                                if (publisherElem.hasOwnProperty("jid-im")) {
                                    publisher.jid_im = publisherElem["jid-im"];
                                    //publisher.contact = await that._contactsService.getContactByJid(publisher.jid_im);
                                }

                                // Create an empty MEdia list if null
                                if (publisher.media==null)
                                    publisher.media = new List<string>();

                                if (publisherElem.hasOwnProperty("media-type")) {
                                    let media: string = publisherElem["media-type"];

                                    if (!publisher.media.any((item: string) => {
                                        return media===item;
                                    }))
                                        publisher.media.add(media);
                                }

                                if (publisherElem.hasOwnProperty("simulcast"))
                                    publisher.simulcast = publisherElem["simulcast"];
                                
                                // Finally add the publisher only if a Media is specified
                                if (publisher.media.count() > 0)
                                    publishers.add(publisher);
                            } else {
                                if (publisher!=null) {
                                    if (publisher.media!=null) {
                                        if (publisherElem.hasOwnProperty("media-type")) {
                                            let media: string = publisherElem["media-type"];
                                            publisher.media.remove((item: string) => {
                                                return media===item;
                                            });
                                            if (publisher.media.count() > 0) {
                                                // A media is still used by this publisher - so we add it to the list
                                                publishers.add(publisher);
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }

                    // Finally update Participants list from conference object
                    conference.publishers = publishers;
                }
            } else {
                for (const [key, value] of Object.entries(xmlElementList)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parsePublishersFromConferenceUpdatedEvent) property of Objects : key : ", key ,", value :", value);
                    let publisherElem = value;
                    if (publisherElem["participant-id"]!=null || publisherElem["publisher-id"]!=null || publisherElem["user-id"]) {
                        publisherId = publisherElem["publisher-id"];
                        if (!publisherId) publisherId = publisherElem["participant-id"];
                        if (!publisherId) publisherId = publisherElem["user-id"];

                        // Get publisher (if any)
                        publisher = null;
                        publishers.forEach((p: Publisher) => {
                            //foreach ( p : Participant in participants)
                            //{
                            if (p.id==publisherId) {
                                // Store it
                                publisher = p;

                                // Remove from the list
                                publishers.remove((item: Publisher) => {
                                    return p.id===item.id;
                                });
                            }
                        });

                        let participant : Participant = null;
                        participants.forEach((p: Participant) => {
                            if (p.id==publisherId) {
                                // Store it
                                participant = p;
                            }
                        });

                        if (add) {

                            // Create new one if not found
                            if (publisher==null) {
                                publisher = new Publisher(publisherId);
                            }
                            
                            publisher.participant = participant;

                            if (publisherElem.hasOwnProperty("jid-im")) {
                                publisher.jid_im = publisherElem["jid-im"];
                                //publisher.contact = await that._contactsService.getContactByJid(publisher.jid_im);
                            }

                            // Create an empty MEdia list if null
                            if (publisher.media==null)
                                publisher.media = new List<string>();

                            if (publisherElem.hasOwnProperty("media-type")) {
                                let media: string = publisherElem["media-type"];

                                if (!publisher.media.any((item: string) => {
                                    return media===item;
                                }))
                                    publisher.media.add(media);
                            }

                            if (publisherElem.hasOwnProperty("simulcast"))
                                publisher.simulcast = publisherElem["simulcast"];

                            // Finally add the publisher only if a Media is specified
                            if (publisher.media.count() > 0)
                                publishers.add(publisher);
                        } else {
                            if (publisher!=null) {
                                if (publisher.media!=null) {
                                    if (publisherElem.hasOwnProperty("media-type")) {
                                        let media: string = publisherElem["media-type"];
                                        publisher.media.remove((item: string) => {
                                            return media===item;
                                        });
                                        if (publisher.media.count() > 0) {
                                            // A media is still used by this publisher - so we add it to the list
                                            publishers.add(publisher);
                                        }
                                    }
                                }
                            }
                        }

                    }
                }

                // Finally update Participants list from conference object
                conference.publishers = publishers;
            }

        } else {
            let publishers = new List<Publisher>();
            conference.publishers = publishers;
        }
    }

    async parseServicesFromConferenceUpdatedEvent(conference: ConferenceSession, xmlElementList, add: boolean) {
        let that = this;
        if (xmlElementList!=null) {
            let services: List<Service> = conference.services;
            services = new List<Service>();

            if (Array.isArray(xmlElementList.service)) {
                for (let i = 0; i < xmlElementList.service.length; i++) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseServicesFromConferenceUpdatedEvent) xmlElementList iter index : ", i);
                    for (const [key, value] of Object.entries(xmlElementList.service[i])) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(parseServicesFromConferenceUpdatedEvent) property of Objects : key : ", key, ", value :", value);
                        let serviceElem = value;
                        if (serviceElem!=null) {
                            let serviceId = serviceElem["service-id"];
                            let serviceType = serviceElem["service-type"];
                            let service = new Service();
                            service.serviceId = serviceId;
                            service.serviceType = serviceType;
                            services.add(service);
                        }
                    }
                    conference.services = services;
                }
            } else {
                for (const [key, value] of Object.entries(xmlElementList)) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(parseServicesFromConferenceUpdatedEvent) property of Objects : key : ", key, ", value :", value);
                    let serviceElem = value;
                    if (serviceElem!=null) {
                        let serviceId = serviceElem["service-id"];
                        let serviceType = serviceElem["service-type"];
                        let service = new Service();
                        service.serviceId = serviceId;
                        service.serviceType = serviceType;
                        services.add(service);
                    }
                }
                conference.services = services;
            }

        } else {
            let services = new List<Service>();
            conference.services = services;
        }
    }

    async _onMessageReceived (conversationId, data) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) _entering_ : ", conversationId, data);
            let conversation = that._conversationService.getConversationById(conversationId);
            let cs = this._conversationService;
            if (!conversation) {
                that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) conversation NOT found in cache by Id : ", conversationId, ", for new message : ", data);
                let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId) : cs.getOrCreateOneToOneConversation(conversationId);
                createPromise.then((conv) => {
                    data.conversation = conv;
                    if (that.storeMessagesInConversation) {
                        data.conversation.addOrUpdateMessage(data);
                        /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                            data.conversation.messages.push(data);
                        } // */
                    }
                    this.eventEmitter.emit("evt_internal_onmessagereceived", data);
                    that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                    //that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) cs.getConversations() : ", cs.getConversations());
                });
            } else {
                that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data);
                if (data.event === "conferenceAdd") {
                    that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data, ", but needed to be updated because event conferenceAdd on bubble received.");
                    conversation.bubble = await that._bubbleService.getBubbleByJid(conversationId, true);
                }

                // data.conversation =  conversationId.startsWith("room_") ? await cs.getBubbleConversation(conversationId) : await cs.getOrCreateOneToOneConversation(conversationId);
                // data.conversation.addMessage(data);
                // that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data, ", but needed to be updated because event conferenceAdd on bubble received." );
                // */
                that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data);
                data.conversation = conversation;
                if (that.storeMessagesInConversation) {
                    data.conversation.addOrUpdateMessage(data);
                    /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                        data.conversation.messages.push(data);
                    } // */
                }
                that.eventEmitter.emit("evt_internal_onmessagereceived", data);
                that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                //that._logger.log(that.INTERNAL, LOG_ID + "(_onMessageReceived) cs.getConversations() : ", cs.getConversations());
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onMessageReceived) CATCH Error !!! : ", err);
        }
    }

    onRoomAdminMessageReceived (msg, stanzaTab) {
    }

    onFileMessageReceived (msg, stanzaTab) {
    }

    onWebRTCMessageReceived (msg, stanzaTab) {
        // No treatment, dedicated to Call Log later
    }

    onManagementMessageReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, prettyStanza, jsonStanza);
            /*
            let conversation = that._conversationService.getConversationById(msg.conversationId);
            if (conversation) {
                that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) conversation found in cache by Id : ", msg.conversationId, ", for new message : ", msg);
                msg.conversation = conversation;
                that.eventEmitter.emit("evt_internal_onmessagereceived", msg);
                that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
            } else {
                that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) conversation NOT found in cache by Id : ", msg.conversationId, ", for new message : ", msg);
            }
            // */
            let children = stanza.children;
            children.forEach(function (node) {
                let nodeJson = jsonStanza.message[node.getName()];
                switch (node.getName()) {
                    case "room":
                        that.onRoomManagementMessageReceived(node, nodeJson);
                        break;
                    case "usersettings":
                        that.onUserSettingsManagementMessageReceived(node);
                        break;
                    case "userinvite":
                        that.onUserInviteManagementMessageReceived(node);
                        // treated also in invitationEventHandler
                        break;
                    case "group":
                        that.onGroupManagementMessageReceived(node);
                        break;
                    case "conversation":
                        that.onConversationManagementMessageReceived(node);
                        break;
                    case "mute":
                        that.onMuteManagementMessageReceived(node);
                        break;
                    case "unmute":
                        that.onUnmuteManagementMessageReceived(node);
                        break;
                    case "file":
                        that.onFileManagementMessageReceived(node);
                        break;
                    case "thumbnail":
                        that.onThumbnailManagementMessageReceived(node);
                        break;
                    case "channel-subscription":
                    case "channel":
                        //treated in channelEventHandler::onFavoriteManagementMessageReceived(node);
                        break;
                    case "openinvite":
                        // treated in invitationEventHandler
                        break;
                    case "favorite":
                        // treated in favoriteEventHandler
                        break;
                    case "notification":
                        // treated in alertEventHandler
                        break;
                    case "roomscontainer":
                        that.onRoomsContainerManagementMessageReceived(node);
                        break;
                    case "webinar":
                        // treated in webinarEventHandler
                        break;
                    case "poll":
                        if (node.attrs.xmlns==="jabber:iq:configuration") {
                            let action = node.attrs.action;
                            let roomId = node.getChild("roomid") ? node.getChild("roomid").text() : (node.getChild("room-id") ? node.getChild("room-id").text() : undefined);
                            let pollId = node.getChild("pollid") ? node.getChild("pollid").text() : (node.getChild("poll-id") ? node.getChild("poll-id").text() : undefined);
                            let pollObj = {
                                "action": action,
                                "roomid": roomId,
                                "pollid": pollId,
                            };
                            that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) configure - poll : ", pollObj);
                            that.eventEmitter.emit("evt_internal_bubblepollconfiguration", pollObj);
                        }
                        break;
                    case "connectorcommand":
                        that.onConnectorCommandManagementMessageReceived(node);
                        break;
                    case "connectorconfig":
                        that.onConnectorConfigManagementMessageReceived(node);
                        break;
                    case "command_ended":
                        that.onConnectorCommandEndedMessageReceived(node);
                        break;
                    case "import_status":
                        that.onConnectorImportStatusMessageReceived(node);
                        break;
                    case "joincompanyinvite":
                        // treated in invitationEventHandler
                        break;
                    case "joincompanyrequest":
                        // treated in invitationEventHandler
                        break;
                    case "logs":
                        that.onLogsMessageReceived(node);
                        break;
                    case "no-store":
                        // ignore that information
                        break;
                    case "userpassword":
                        that.onUserPasswordMessageReceived(jsonStanza[stanza.getName()]["userpassword"]);
                        break;
                    case "todo":
                        // treated in tasksEventHandler
                        break;
                    default:
                        that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) unmanaged management message node " + node.getName());
                        break;
                }
            });
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onRoomManagementMessageReceived(node, nodeJson) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onRoomManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node, nodeJson);
            if (node.attrs.xmlns==="jabber:iq:configuration") {

                // Affiliation changed (my own or for a member)
                if (node.attrs.status) {
                    if (node.attrs.userjid===xu.getBareJIDFromFullJID(that.fullJid)) {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble management received for own.");
                        that.eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "userJid": node.attrs.userjid,
                            "status": node.attrs.status,
                        });
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble affiliation received");
                        let payloads = nodeJson?.payload;
                        let userdata = undefined;
                        if (payloads) {
                            for (let i = 0; i < payloads.length; i++) {
                                if (payloads[i]['$attrs'].datatype==="urn:rainbow:json:userdata") {
                                    userdata = payloads[i].json?._;
                                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) userdata : ", userdata);
                                }
                            }
                        }

                        that.eventEmitter.emit("evt_internal_affiliationchanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "userJid": node.attrs.userjid,
                            "status": node.attrs.status,
                            "userdata": userdata
                        });
                    }
                }
                // vcard changed
                else if (node.attrs.vcard) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble vcard updated changed");
                    let contact = await that._contactsService.getContactByJid(node.attrs.userjid, false);
                    that.eventEmitter.emit("evt_internal_contactchanged", {
                        "action": node.attrs.vcard, // "updated"
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "peer" : {
                            "userjid": node.attrs.userjid,
                            "contact": contact,
                            "vcard": nodeJson?.vcard /*  vcard: { displayname: 'ddd eeeee', lastname: 'eeeee', firstname: 'ddd', companyNameOfGuest: undefined, lastavatarupdatedate: undefined } // */
                        }
                    });

                }
                // Custom data changed
                else if (node.attrs.customData) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble custom-data changed");
                    that.eventEmitter.emit("evt_internal_customdatachanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "customData": node.attrs.customData
                    });
                }
                // Topic changed
                if (node.attrs.topic) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble topic changed");
                    that.eventEmitter.emit("evt_internal_topicchanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "topic": node.attrs.topic
                    });
                }  // Topic changed
                if (node.attrs.privilege) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble privilege changed");
                    that.eventEmitter.emit("evt_internal_privilegechanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "userjid": node.attrs.userjid,
                        "privilege": node.attrs.privilege
                    });
                }
                // Name changed
                if (node.attrs.name) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble name changed");
                    that.eventEmitter.emit("evt_internal_namechanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "name": node.attrs.name
                    });
                }
                let lastAvatarUpdateDate = node.attrs.lastAvatarUpdateDate;
                let avatarElem = node.find("avatar");
                let avatarType = null;
                if (avatarElem.length > 0) {
                    if (avatarElem.attr("action")==="delete") {
                        avatarType = "delete";
                    } else {
                        avatarType = "update";
                    }
                }
                if (lastAvatarUpdateDate || avatarType) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onRoomManagementMessageReceived) bubble avatar changed");
                    that.eventEmitter.emit("evt_internal_bubbleavatarchanged", {"bubbleId": node.attrs.roomid});
                    /*service.getServerRoom(room.dbId)
                        .then(function(roomToUpdate) {
                            roomToUpdate.updateAvatarInfo();
                            $rootScope.$broadcast(service.ROOM_AVATAR_UPDATE_EVENT, room);
                        }); // */
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onRoomManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onRoomManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onUserSettingsManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.DEBUG, LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_");
            that._logger.log(that.INTERNAL, LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "update":
                        that._logger.log(that.DEBUG, LOG_ID + "(onUserSettingsManagementMessageReceived) usersettings updated");
                        that.eventEmitter.emit("evt_internal_usersettingschanged");
                        break;
                    default:
                        break;
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onUserSettingsManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onUserSettingsManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onUserInviteManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) _entering_");
            that._logger.log(that.INTERNAL, LOG_ID + "(onUserInviteManagementMessageReceived) _entering_", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            /*
            // Know the treatment is done in invitationEventHandler
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) xmlns configuration, treat action : ");
                switch (node.attrs.action) {
                    case "create":
                            that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) user invite received");
                            that.eventEmitter.emit("evt_internal_userinvitemngtreceived", {invitationId: node.attrs.id});
                        break;
                    case "update":
                        if (node.attrs.type === "sent" && node.attrs.status === "canceled") {
                            that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) user invite canceled");
                            that.eventEmitter.emit("evt_internal_userinvitecanceled", {invitationId: node.attrs.id});
                        } else if (node.attrs.type === "sent" && node.attrs.status === "accepted") {
                            that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) user invite accepted");
                            that.eventEmitter.emit("evt_internal_userinviteaccepted", {invitationId: node.attrs.id});
                        }
                        break;
                    default:
                        that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) action not reconized, so default switch used to do nothing.");
                        break;
                }
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(onUserInviteManagementMessageReceived) not xmlns configuration, ignore it : ", node.attrs.xmlns);
            }
            // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onUserInviteManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onUserInviteManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onGroupManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onGroupManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                let action = node.attrs.action;
                let scope = node.attrs.scope;

                if (action === "create" && scope === "group") {
                    that._logger.log(that.DEBUG, LOG_ID + "(onGroupManagementMessageReceived) group created");
                    that.eventEmitter.emit("evt_internal_hdle_groupcreated", {"groupId": node.attrs.id});
                } else if (action === "create" && scope === "user" && node.attrs.userId) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onGroupManagementMessageReceived) user added in group");
                    that.eventEmitter.emit("evt_internal_hdle_useraddedingroup", {
                        "groupId": node.attrs.id,
                        "userId": node.attrs.userId
                    });
                } else if (action === "delete" && scope === "group") {
                    that._logger.log(that.DEBUG, LOG_ID + "(onGroupManagementMessageReceived) group deleted");
                    that.eventEmitter.emit("evt_internal_hdle_groupdeleted", {"groupId": node.attrs.id});
                } else if (action === "delete" && scope === "user" && node.attrs.userId) {
                    that._logger.log(that.DEBUG, LOG_ID + "(onGroupManagementMessageReceived) user removed from group");
                    that.eventEmitter.emit("evt_internal_hdle_userremovedfromgroup", {
                        "groupId": node.attrs.id,
                        "userId": node.attrs.userId
                    });
                } else if (action === "update" && scope === "group") {
                    if (node.attrs.name || node.attrs.comment || node.attrs.isFavorite) {
                        that._logger.log(that.DEBUG, LOG_ID + "(onGroupManagementMessageReceived) group updated");
                        that.eventEmitter.emit("evt_internal_hdle_groupupdated", {"groupId": node.attrs.id});
                    }
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onGroupManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onGroupManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onConversationManagementMessageReceived (node: Element) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onConversationManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                let conversationId = node.attrs.id;
                let conversation : Conversation = this._conversationService.getConversationById(conversationId);
                let action = node.attrs.action;
                that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) action : " + action + ", conversationId : ", conversationId);
                that._logger.log(that.INTERNAL, LOG_ID + "(onConversationManagementMessageReceived) action : " + action + ", for conversation : ", conversation);

                if (conversation) {
                    switch (action) {
                        case "create":
//                                conversation.dbId = node.getAttribute("id");
                            conversation.dbId = conversationId;
                            conversation.lastModification = new Date(node.find("lastMessageDate").text());
                            conversation.missedCounter = parseInt(node.find("unreadMessageNumber").text(), 10) || 0;
                            conversation.isFavorite = (node.find("isFavorite").text() === "true");
                            //this.conversationService.orderConversations();
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            // Send conversations update event
                            that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            break;
                        case "delete":
                            this._conversationService.removeConversation(conversation);
                            break;
                        case "update":
                            conversation.isFavorite = (node.find("isFavorite").text() === "true");
                            if (node.find("bookmark")) {
                                /* <bookmark>
                                <messageId>web_679434c5 - 1616 - 49e7 - ab10 - d346ec3f99ed0 < /messageId>
                                < timestamp > 1678714877813903 < /timestamp>
                                < unreadMessageNumber > 1 < /unreadMessageNumber>
                                < /bookmark>
                                // */
                                conversation.bookmark = {
                                    "messageId" : node.find("messageId").text(),
                                    "timestamp" : node.find("timestamp").text(),
                                    "unreadMessageNumber" : node.find("unreadMessageNumber").text()
                                };
                            }
                            //this.conversationService.orderConversations();
                            // Send conversations update event
                            that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            break;
                        default:
                            break;
                    }
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) conversation not know in cache action : ", action + ", conversationId : ", conversationId);
                    if (action === "create") {
                        let convId = xu.getBareJIDFromFullJID(node.find("peer").text());
                        let peerId = node.find("peerId").text();

                        let convDbId = node.attrs.id;
                        let lastModification = new Date(node.find("lastMessageDate").text());
                        let lastMessageText = node.find("lastMessageText").text();
                        let lastMessageSender = node.find("lastMessageSender").text();
                        let missedIMCounter = parseInt(node.find("unreadMessageNumber").text(), 10) || 0;
                        let muted = node.find("mute").text() === "true";
                        let isFavorite = node.find("isFavorite").text() === "true";
                        let type = node.find("type").text();

                        let conversationGetter = null;
                        if (type === "user") {
                            that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) create, find conversation, user. convDbId : ", convDbId, ", peerId : ", peerId);
                            conversationGetter = this._conversationService.getOrCreateOneToOneConversation(convId);
                        } else {
                            let bubbleId = convId;
                            that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) create, find conversation, bubbleId : " + bubbleId + ", convDbId : ", convDbId, ", peerId : ", peerId);
                            // conversationGetter = this.conversationService.getConversationByBubbleId(convId);
                            conversationGetter = this._conversationService.getBubbleConversation(bubbleId, peerId, lastModification, lastMessageText, missedIMCounter, null, muted, new Date(), lastMessageSender);
                        }

                        if (!conversationGetter) {
                            return;
                        }

                        await conversationGetter.then(function (conv) {
                            if (!conv) {
                                that._logger.log(that.INTERNAL, LOG_ID + "(onConversationManagementMessageReceived) conversation not found! will not raise event.");
                                return;
                            }
                            that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) update conversation (" + conv.id + ")");
                            conv.dbId = convDbId;
                            conv.lastModification = lastModification ? new Date(lastModification) : undefined;
                            conv.lastMessageText = lastMessageText;
                            conv.lastMessageSender = lastMessageSender;
                            conv.muted = muted;
                            conv.isFavorite = isFavorite;
                            conv.preload = true;
                            conv.missedCounter = missedIMCounter;
                            // Send conversations update event
                            that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT", conv);
                        });
                    }

                    if (action === "delete") {
                        that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) conversation not know in cache deleted : ", conversationId);
                        let conversationUnknown = new Conversation(conversationId, that._logger, that.maxMessagesStoredInConversation);
                        if (conversationUnknown) {
                            that._conversationService.removeConversation(conversationUnknown);
                        }
                    }
                }

                // Handle mute/unmute room
                if (node.find("mute") || node.find("unmute")) {
                    let muteElem = node.find("mute");
                    let mute = false;
                    if (muteElem.length) {
                        if (muteElem.text().length) {
                            mute = (muteElem.text() === "true");
                        } else {
                            mute = true;
                        }
                    }
                    let conversationDbId = node.find("mute").attrs.conversation || node.find("unmute").attrs.conversation;
                    let conversation = this._conversationService.getConversationByDbId(conversationDbId);
                    if (conversation) {
                        that._logger.log(that.DEBUG, LOG_ID + "(onConversationManagementMessageReceived) : mute is changed to " + mute);
                        conversation.muted = mute;
                    }
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onConversationManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onConversationManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onMuteManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onMuteManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onMuteManagementMessageReceived) conversation muted");
                let conversationId = node.attrs.conversation;
                let conversation = that._conversationService.getConversationById(conversationId);
                if (!conversation) {
                    let cs = this._conversationService;
                    let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId,undefined, undefined, undefined, undefined,undefined,undefined,undefined,undefined) : cs.getOrCreateOneToOneConversation(conversationId);
                    createPromise.then((conv) => {
                        that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                    });
                } else {
                    that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onMuteManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onMuteManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onUnmuteManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onUnmuteManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onUnmuteManagementMessageReceived) conversation unmuted");
                let conversationId = node.attrs.conversation;
                let conversation = that._conversationService.getConversationById(conversationId);
                if (!conversation) {
                    let cs = this._conversationService;
                    let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId,undefined, undefined, undefined, undefined,undefined,undefined,undefined,undefined) : cs.getOrCreateOneToOneConversation(conversationId);
                    createPromise.then((conv) => {
                        that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                    });
                } else {
                    that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onUnmuteManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onUnmuteManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onFileManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onFileManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                let updateConsumption: boolean = false;
                switch (node.attrs.action) {
                    case "create": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onFileManagementMessageReceived) file created");

                        let fileNode = node.children[0];
                        let fileid = fileNode.children[0];
                        //.getText() ||  "";

                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (!fileDescriptor) {
                            updateConsumption = true;
                        }

                        await that._fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                            that._logger.log(that.DEBUG, LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                            if (!fileDesc.previewBlob) {
                                that._fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
                                    .then(function (blob) {
                                        fileDesc.previewBlob = blob;
                                    });
                            }
                        });
                        that.eventEmitter.emit("evt_internal_filecreated", {'fileid': fileid});
                    }
                        break;
                    case "update": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onFileManagementMessageReceived) file updated");

                        let fileNode = node.children[0];
                        let fileid = fileNode.children[0];
                        //.getText() ||  "";
                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (!fileDescriptor) {
                            updateConsumption = true;
                        }

                        await that._fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                            that._logger.log(that.DEBUG, LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                            if (!fileDesc.previewBlob) {
                                that._fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
                                    .then(function (blob) {
                                        fileDesc.previewBlob = blob;
                                    });
                            }
                        });
                        that.eventEmitter.emit("evt_internal_fileupdated", {'fileid': fileid});
                    }
                        break;

                    case "delete": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onFileManagementMessageReceived) file deleted");

                        let fileNode = node.children[0];
                        let fileid = fileNode.children[0];
                        //.getText() ||  "";
                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (fileDescriptor) {
                            //check if we've deleted one of our own files
                            if (fileDescriptor.ownerId === that.userId && fileDescriptor.state !== "deleted") {
                                updateConsumption = true;
                            }

                            this._fileStorageService.deleteFileDescriptorFromCache(fileid, true);
                        }

                        that.eventEmitter.emit("evt_internal_filedeleted", {'fileid': fileid});
                    }
                        break;
                    default:
                        break;
                }
                if (updateConsumption) {
                    this._fileStorageService.retrieveUserConsumption();
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onThumbnailManagementMessageReceived (node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onThumbnailManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "create": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onThumbnailManagementMessageReceived) file created");

                        let url = node.getChild('url') ? node.getChild('url').children[0] : '';
                        //let fileId = fileNode.children[0];
                        //.getText() ||  "";
                        let mime = node.getChild('mime') ? node.getChild('mime').children[0] : '';
                        let filename = node.getChild('filename') ? node.getChild('filename').children[0] : '';
                        let size = node.getChild('size') ? node.getChild('size').children[0] : '';
                        let md5sum = node.getChild('md5sum') ? node.getChild('md5sum').children[0] : '';
                        let fileid = node.getChild('fileid') ? node.getChild('fileid').children[0] : '';
                        that.eventEmitter.emit("evt_internal_thumbnailcreated", {
                            'url': url,
                            'mime': mime,
                            'filename': filename,
                            'size': size,
                            'md5sum': md5sum,
                            'fileid': fileid
                        });
                    }
                        break;
                    default:
                        break;
                }
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onThumbnailManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onThumbnailManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onRoomsContainerManagementMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onRoomsContainerManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) JSON : ", jsonNode);
            let roomscontainer = jsonNode["roomscontainer"];
            that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) roomscontainer : ", roomscontainer);
            let containerId = roomscontainer["$attrs"]["containerid"];
            let containerName = roomscontainer.$attrs.name;
            let containerDescription = roomscontainer.$attrs.description?roomscontainer.$attrs.description:"";
            let bubblesIdAdded = roomscontainer["added"]? roomscontainer["added"].roomid : undefined;
            let bubblesIdRemoved = roomscontainer["removed"]? roomscontainer["removed"].roomid : undefined;

            
            
            if (roomscontainer.$attrs.xmlns==="jabber:iq:configuration") {
                let action = roomscontainer.$attrs.action;
                that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) action.");
                that.eventEmitter.emit("evt_internal_roomscontainer", {action, containerName, containerId, containerDescription, bubblesIdAdded, bubblesIdRemoved});
                /*
                switch (roomscontainer.$attrs.action) {
                    case "create": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) create action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainercreated", {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    case "update": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) update action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerupdated",  {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    case "delete": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) delete action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerdeleted", {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    default: {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) unknown action.");
                    }
                        break;
                }
                // */
            } // */
            /*
            if (node.attrs.xmlns==="jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "create": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) create action.");
                        let add = node.getChild('added');
                        let removed = node.getChild('removed');
                        that.eventEmitter.emit("evt_internal_bubblescontainercreated", {});
                    }
                        break;
                    case "update": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) update action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerupdated", {});
                    }
                        break;
                    case "delete": {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) delete action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerdeleted", {});
                    }
                        break;
                    default: {
                        that._logger.log(that.DEBUG, LOG_ID + "(onRoomsContainerManagementMessageReceived) unknown action.");
                    }
                        break;
                }
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onRoomsContainerManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onRoomsContainerManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onConnectorImportStatusMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onConnectorImportStatusMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorImportStatusMessageReceived) JSON : ", jsonNode); // command="manual_synchro" commandId="xyz" xmlns="jabber:iq:configuration" 
            let importstatus = jsonNode["import_status"];
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorImportStatusMessageReceived) importstatus : ", importstatus);
            let reqId = importstatus["$attrs"]["reqId"];
            let seq = importstatus["$attrs"]["seq"];
            let status = importstatus["$attrs"]["status"];
            let failed = importstatus["$attrs"]["failed"];
            let warnings = importstatus["$attrs"]["warnings"];
            let succeeded = importstatus["$attrs"]["succeeded"];
            let total = importstatus["$attrs"]["total"];

            if (importstatus.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onConnectorImportStatusMessageReceived) connectorcommand.");
                that.eventEmitter.emit("evt_internal_connectorimportstatus", {reqId, seq, status, failed, warnings, succeeded, total});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onConnectorImportStatusMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onConnectorImportStatusMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onConnectorCommandManagementMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onConnectorCommandManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandManagementMessageReceived) JSON : ", jsonNode); // command="manual_synchro" commandId="xyz" xmlns="jabber:iq:configuration" 
            let connectorcommand = jsonNode["connectorcommand"];
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandManagementMessageReceived) connectorcommand : ", connectorcommand);
            let command = connectorcommand["$attrs"]["command"];
            let commandId = connectorcommand.$attrs.commandId;
            let ldapConfigId = connectorcommand.$attrs.ldapConfigId;

            if (connectorcommand.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandManagementMessageReceived) connectorcommand.");
                that.eventEmitter.emit("evt_internal_connectorcommand", {command, commandId, ldapConfigId});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onConnectorCommandManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onConnectorCommandManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onConnectorCommandEndedMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onConnectorCommandEndedMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandEndedMessageReceived) JSON : ", jsonNode); // command="manual_synchro" commandId="xyz" xmlns="jabber:iq:configuration" 
            let command_ended  = jsonNode["command_ended"];
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandEndedMessageReceived) command_ended : ", command_ended );
            let commandId = command_ended.$attrs.commandId;

            if (command_ended.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onConnectorCommandEndedMessageReceived) connectorcommand.");
                that.eventEmitter.emit("evt_internal_connectorcommand_ended", {commandId});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onConnectorCommandEndedMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onConnectorCommandEndedMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onConnectorConfigManagementMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onConnectorConfigManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorConfigManagementMessageReceived) JSON : ", jsonNode); // action="update" xmlns="jabber:iq:configuration" 
            let connectorconfig = jsonNode["connectorconfig"];
            that._logger.log(that.DEBUG, LOG_ID + "(onConnectorConfigManagementMessageReceived) connectorconfig : ", connectorconfig);
            let action = connectorconfig["$attrs"]["action"];
            let configId = connectorconfig["$attrs"]["configId"];

            if (connectorconfig.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onConnectorConfigManagementMessageReceived) connectorconfig with action : ", action, ", configId : ", configId);
                that.eventEmitter.emit("evt_internal_connectorconfig", {action, configId});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onConnectorConfigManagementMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onConnectorConfigManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onLogsMessageReceived(node) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onLogsMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onLogsMessageReceived) JSON : ", jsonNode); // action="update" xmlns="jabber:iq:configuration" 
            let logsObj = jsonNode["logs"];
            that._logger.log(that.DEBUG, LOG_ID + "(onLogsMessageReceived) logsObj : ", logsObj);
            let action = logsObj["$attrs"]["action"];
            let contextid = logsObj["$attrs"]["contextid"];

            if (logsObj.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onLogsMessageReceived) connectorconfig with action : ", action, ", contextid : ", contextid);
                that.eventEmitter.emit("evt_internal_logsconfig", {action, contextid});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onLogsMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onLogsMessageReceived) CATCH Error !!! : ", err);
        }
    };
    
    async onUserPasswordMessageReceived(jsonNode) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onLogsMessageReceived) _entering_ : ", "\n", jsonNode);
            that._logger.log(that.DEBUG, LOG_ID + "(onLogsMessageReceived) JSON : ", jsonNode); // action="update" xmlns="jabber:iq:configuration"
            let action = jsonNode["$attrs"]["action"];
            let contextid = jsonNode["$attrs"]["contextid"];

            if (jsonNode.$attrs.xmlns==="jabber:iq:configuration") {
                that._logger.log(that.DEBUG, LOG_ID + "(onLogsMessageReceived) connectorconfig with action : ", action, ", contextid : ", contextid);
                that.eventEmitter.emit("evt_internal_userpasswordconfig", {action, contextid});
            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onLogsMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onLogsMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onReceiptMessageReceived (msg, stanza){
    }

    async onErrorMessageReceived(msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {

            if (stanza.getChild('no-store')!=undefined) {
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) The message could not be delivered.");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", prettyStanza);
                let err = {
                    "id": stanza.attrs.id,
                    "body": stanza.getChild('body').text(),
                    "subject": stanza.getChild('subject').text()
                };
                //that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) no-store message setted...");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) failed to send : ", err);
                that.eventEmitter.emit("evt_internal_onsendmessagefailed", err);
            } else {
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", prettyStanza);
                let errorObject = {
                    message: msg,
                    stanza: stanza.root ? prettydata.xml(stanza.root().toString()):stanza
                };
                that.eventEmitter.emit("evt_internal_xmpperror", errorObject);
            }

            try {
                let textElement = stanza.find("text");
                let text = (textElement && textElement.length) ? textElement.text():"";
                if (text==="Only occupants are allowed to send messages to the conference") {
                    that._logger.log(that.ERROR, LOG_ID +"(onErrorMessageReceived) error -- missing presence in the bubble, resend it");
                    const fromJid = stanza.attrs.from;
                    let bubble = await that._bubbleService.getBubbleByJid(fromJid);
                    if (bubble) {
                        await that._presenceService.sendInitialBubblePresenceSync(bubble);
                    }
                    /*const room = this.getRoomByJid(fromJid);
                    if (room) {
                        room.initPresenceAck = false;
                        this.sendInitialRoomPresenceSync(room);
                        room.isActive = true;
                        this.eventService.publish(this.ROOM_UPDATE_EVENT, room);
                        this.sendEvent(this.ROOM_UPDATE_EVENT, room);
                    } // */
                }
                //return true;
            } catch (_err) {
                // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! while sending bubble initial presence.");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! while sending bubble initial presence : ", _err);
                //return true;
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    }

    onCloseMessageReceived (msg, stanzaTab) {

    }

}

export {ConversationEventHandler};
module.exports.ConversationEventHandler = ConversationEventHandler;
