"use strict";
import {RESTService} from "../RESTService";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

import {Conversation} from "../../common/models/Conversation";
import {Channel} from "../../common/models/Channel";
import {logEntryExit} from "../../common/Utils";
import {GenericHandler} from "./GenericHandler";

const util = require('util');

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/CHNL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class ChannelEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    public channelsService: any;
    /*public onManagementMessageReceived: any;
    public onChannelManagementMessageReceived: any;
    public onHeadlineMessageReceived: any;
    public onReceiptMessageReceived: any;
    public onErrorMessageReceived: any;

     */
    public findAttrs: any;
    public findChildren: any;

    static getClassName(){ return 'ChannelEventHandler'; }
    getClassName(){ return ChannelEventHandler.getClassName(); }

    static getAccessorName(){ return 'channelevent'; }
    getAccessorName(){ return ChannelEventHandler.getAccessorName(); }

    constructor(xmppService, channelsService) {
        super(xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this.channelsService = channelsService;

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

    onManagementMessageReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];
/*
 <message
  xmlns="jabber:client" xml:lang="en" to="98091bcde14d4eadac763d9cc0851719@openrainbow.net" from="pcloud_channels_4@openrainbow.net/568609553786869444554092965" type="management" id="89d61026-02a0-45ce-912d-a9c2486235b2_13603">
  <channel
    xmlns="jabber:iq:configuration" channelid="66d9cf1a9d26c83635bc90a6" action="add">
    <name>tes...nel</name>
    <category>glo...ews</category>
    <type>o...r</type>
    <comments>e...e</comments>
  </channel>
</message>
// */
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, prettyStanza);
            let children = stanza.children;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "room":
                        // treated in conversationEventHandler
                        break;
                    case "usersettings":
                        // treated in conversationEventHandler
                        break;
                    case "userinvite":
                        // treated also in conversationEventHandler
                        // treated also in invitationEventHandler
                        break;
                    case "group":
                        // treated in conversationEventHandler
                        break;
                    case "conversation":
                        // treated in conversationEventHandler
                        break;
                    case "mute":
                        // treated in conversationEventHandler
                        break;
                    case "unmute":
                        // treated in conversationEventHandler
                        break;
                    case "file":
                        // treated in conversationEventHandler
                        break;
                    case "thumbnail":
                        // treated in conversationEventHandler
                        break;
                    case "channel-subscription":
                    case "channel":
                        that.onChannelManagementMessageReceived(node);
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
                    case "logs":
                        // treated in conversationEventHandler
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

    onHeadlineMessageReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onHeadlineMessageReceived) _entering_ : ", msg, prettyStanza);
            that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) message received");

            let eventNode = stanza.children[0];
            if (!eventNode || eventNode.name != "event") {
                that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) it is not an event message.");
                that._logger.log(that.INTERNAL, LOG_ID + "(onHeadlineMessageReceived) it is not an event message, stanza: " + stanza);
                that._logger.log(that.INTERNAL, LOG_ID + util.inspect(stanza));
                return;
            }
            let items = eventNode.children[0];
            if (!items) {
                that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) ERROR in onHeadlineMessageReceived items is empty");
                that._logger.log(that.INTERNAL, LOG_ID + util.inspect(eventNode));
                that._logger.log(that.INTERNAL, LOG_ID + ", stanza: " + stanza);
                return;
            }
            let item = items.children[0];
            if (!item) {
                that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) ERROR in onHeadlineMessageReceived item is empty");
                that._logger.log(that.INTERNAL, LOG_ID + util.inspect(items));
                that._logger.log(that.INTERNAL, LOG_ID + ", stanza: " + stanza);
                return;
            }
            let entry = item.children[0];
            if (!entry) {
                that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) onHeadlineMessageReceived entry is empty");
                that._logger.log(that.INTERNAL, LOG_ID + util.inspect(item));
                that._logger.log(that.INTERNAL, LOG_ID + ", stanza: " + stanza);
                //return;
            }

            switch (item.name) {
                case "my_appreciation": {
                    // <message xmlns="jabber:client" to="a9b77288b939470b8da4611cc2af1ed1@openrainbow.com/52984746919062435855569220" from="pubsub.openrainbow.com" type="headline" id="8840206819928441857"><event xmlns="http://jabber.org/protocol/pubsub#event"><update id="628D19BF3E372" channel_id="5dea7c6294e80144c1776fe1" node="5dea7c6294e80144c1776fe1:RNodeSdkChangeLog"><my_appreciation appreciation="like" xmlns="http://jabber.org/protocol/pubsub"/><appreciations doubt="0" happy="0" fantastic="0" applause="0" like="1" xmlns="http://jabber.org/protocol/pubsub"/></update></event></message>
                    let appreciation = item.attrs ? item.attrs.appreciation || null : null;
                    if (appreciation === null) {
                        that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) channel my_appreciation received, but appreciation is empty. So ignored.");
                    } else {
                        let my_appreciation = {
                            appreciation: null,
                            messageId: null,
                            channelId : null,
                            appreciations : {
                                "doubt" : 0,
                                "happy" : 0,
                                "fantastic" : 0,
                                "applause" : 0,
                                "like" : 0
                            }
                        };
                        my_appreciation.appreciation = item.attrs.appreciation;
                        my_appreciation.messageId = item.parent.attrs.id ;
                        my_appreciation.channelId = item.parent.attrs.channel_id;
                        //"message": entry.getChild("message") ? entry.getChild("message").getText() || "" : "",
                        let appreciations = item.parent.getChild("appreciations");
                        if (appreciations) {
                            my_appreciation.appreciations.doubt = parseInt(appreciations.attrs.doubt);
                            my_appreciation.appreciations.happy = parseInt(appreciations.attrs.happy);
                            my_appreciation.appreciations.fantastic = parseInt(appreciations.attrs.fantastic);
                            my_appreciation.appreciations.applause = parseInt(appreciations.attrs.applause);
                            my_appreciation.appreciations.like = parseInt(appreciations.attrs.like);
                        }

                        that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) channel my_appreciation received, for my_appreciation ", my_appreciation);
                        that.eventEmitter.emit("evt_internal_channelbyidmyappreciationreceived", my_appreciation);
                    }
                }
                    break;
                case "retract": {
                    let messageId = item.attrs ? item.attrs.id || null : null;
                    if (messageId === null) {
                        that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) channel retract received, but id is empty. So ignored.");
                    } else {
                        let message = { messageId: null};
                        message.messageId = item.attrs.id;
                        that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) channel retract received, for messageId " + message.messageId);
                        that.eventEmitter.emit("evt_internal_channelmessagedeletedreceived", message);
                    }
                }
                    break;
                case "item": {
                    if (entry) {

                        let message = {
                            "messageId": item.attrs.id,
                            "channelId": entry.attrs.channelId,
                            "fromJid": entry.attrs.from,
                          //  "message": entry.getChild("message") ? entry.getChild("message").getText() || "" : "",
                          //  "title": entry.getChild("title") ? entry.getChild("title").getText() || "" : "",
                          //  "url": entry.getChild("url") ? entry.getChild("url").getText() || "" : "",
                            "date": new Date(entry.attrs.timestamp),
                            "images": new Array()
                        };

                        for (const child of entry.children) {
                            if (child.getName) {
                                for (const childTxt of child.children) {
                                    if (typeof childTxt==="string" || typeof childTxt==="number") {
                                        //that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) channel entry child : ", childTxt);
                                        if (message[child.getName()] !== undefined) {
                                            //that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) channel entry child.getName() : ", child.getName(), ", message[child.getName()] : ", message[child.getName()]);
                                            if (Array.isArray(message[child.getName()])) {
                                                if (childTxt != null && childTxt != "null") {
                                                    message[child.getName()].push(childTxt);
                                                }
                                            } else {
                                                let valueSaved = message[child.getName()];
                                                message[child.getName()] = [];
                                                message[child.getName()].push(valueSaved);
                                                message[child.getName()].push(childTxt);
                                            }
                                        } else {
                                            message[child.getName()] = childTxt;
                                        }
                                    }
                                }
                            }
                        }
                        
                        let images = entry.getChildren("images");
                        if (Array.isArray(images)) {
                            images.forEach((image) => {
                                //that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) channel entry images.", image);
                                let id = image.getChild("id") ? image.getChild("id").getText() || null : null;
                                if (id === null) {
                                    that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) channel image entry received, but image id empty. So ignored.");
                                } else {
                                    message.images.push(id);
                                }
                            });
                        }

                        that.eventEmitter.emit("evt_internal_channelitemreceived", message);
                    } else {
                        // that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) channel entry received, but empty. It can not be parsed, so ignored.");
                        that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) channel entry received, but empty. It can not be parsed, so ignored. : ", stanza);
                    }
                }
                    break;
                case "update":
                    that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) update unknown event, channel item : ", item + " received, entry : ", entry);

                    break;
                default: {
                    that._logger.log(that.WARN, LOG_ID + "(onHeadlineMessageReceived) channel unknown event " + item.name + " received");
                    that._logger.log("internalwarn", LOG_ID + "(onHeadlineMessageReceived) channel unknown event, channel item : ", item + " received, entry : ", entry);
                }
                    break;

            } // */
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onChannelManagementMessageReceived (stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onChannelManagementMessageReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

        try {
            if (stanza.attrs.xmlns === "jabber:iq:configuration") {
                let channelElem = stanza.find("channel");
                if (channelElem && channelElem.length > 0) {

                    // Extract channel identifier
                    let channelId = channelElem.attrs.channelid;

                    // Handle cached channel info
                    /*
                    let channel: Channel = this.getChannelFromCache(channelId);
                    if (channel) {
                        let avatarElem = channelElem.find("avatar");
                        let nameElem = channelElem.find("name");
                        let topicElem = channelElem.find("topic");
                        let categoryElem = channelElem.find("category");

                        if (avatarElem && avatarElem.length > 0) {
                            this.onAvatarChange(channelId, avatarElem);
                        }
                        if (nameElem && nameElem.length > 0) {
                            channel.name = nameElem.text();
                        }
                        if (topicElem && topicElem.length > 0) {
                            channel.topic = topicElem.text();
                        }
                        if (categoryElem && categoryElem.length > 0) {
                            channel.category = categoryElem.text();
                        }
                    }
                    // */

                    // Handle channel action events
                    let action = channelElem.attrs.action;
                    that._logger.log(that.DEBUG, LOG_ID + "(onChannelManagementMessageReceived) - action : " + action + " event received on channel " + channelId);
                    switch (action) {
                        case 'add':
                            that.eventEmitter.emit("evt_internal_addtochannel", {'id': channelId});
                            // this.onAddToChannel(channelId);
                            break;
                        case 'update':
                            that.eventEmitter.emit("evt_internal_updatetochannel", {'id': channelId});
                            //this.onUpdateToChannel(channelId);
                            break;
                        case 'remove':
                            that.eventEmitter.emit("evt_internal_removefromchannel", {'id': channelId});
                            //this.onRemovedFromChannel(channelId);
                            break;
                        case 'subscribe':
                            that.eventEmitter.emit("evt_internal_subscribetochannel", {'id': channelId, 'subscribers' : channelElem.attrs.subscribers});
                            //this.onSubscribeToChannel(channelId, channelElem.attrs.subscribers);
                            break;
                        case 'unsubscribe':
                            that.eventEmitter.emit("evt_internal_unsubscribetochannel", {'id': channelId, 'subscribers' : channelElem.attrs.subscribers});
                            //this.onUnsubscribeToChannel(channelId, channelElem.attrs.subscribers);
                            break;
                        case 'delete':
                            //this.onDeleteChannel(channelId);
                            that.eventEmitter.emit("evt_internal_deletechannel", {'id': channelId});
                            break;
                        default:
                            break;
                    }
                }

                let channelSubscriptionElem = stanza.find("channel-subscription");
                if (channelSubscriptionElem && channelSubscriptionElem.length > 0) {
                    // Extract information
                    let channelId = channelSubscriptionElem.attrs.channelid;
                    let action = channelSubscriptionElem.attrs.action;
                    let userId = channelSubscriptionElem.attrs.id;
                    let subscribers = channelSubscriptionElem.attrs.subscribers;
                    that._logger.log(that.DEBUG, LOG_ID + "(onChannelManagementMessageReceived) - subscription- action : ", action, " event received on channelId : ", channelId, ", userId : ", userId, ", subscribers : ", subscribers);

                    switch (action) {
                        case 'subscribe':

                            that.eventEmitter.emit("evt_internal_usersubscribechannel", {'id': channelId, 'userId': userId, 'subscribers': Number.parseInt("0"+subscribers)});
                            //this.onUserSubscribeEvent(channelId, userId);
                            break;
                        case 'unsubscribe':
                            that.eventEmitter.emit("evt_internal_userunsubscribechannel", {'id': channelId, 'userId': userId, 'subscribers': Number.parseInt("0"+subscribers)});
                            //this.onUserUnsubscribeEvent(channelId, userId);
                            break;
                        default:
                            break;
                    }
                }
            }
            return true;
        }
        catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onChannelManagementMessageReceived) -- failure -- " );
            that._logger.log(that.ERROR, LOG_ID + "(onChannelManagementMessageReceived) -- failure -- : " + err.message);
            return true;
        }
    };


    onReceiptMessageReceived (msg, stanza) {
    };

    onErrorMessageReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            if (stanza.getChild('no-store') != undefined){
                // // Treated in conversation handler that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
            } else {
                // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong...", msg, "\n", prettyStanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    };


}

export {ChannelEventHandler};
module.exports.ChannelEventHandler = ChannelEventHandler;
