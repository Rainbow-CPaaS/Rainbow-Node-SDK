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

const LOG_ID = "XMPP/HNDL/FAV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class FavoriteEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    public channelsService: any;
    /*public onManagementMessageReceived: any;
    public onFavoriteManagementMessageReceived: any;
    public onHeadlineMessageReceived: any;
    public onReceiptMessageReceived: any;
    public onErrorMessageReceived: any;

     */
    public findAttrs: any;
    public findChildren: any;

    static getClassName(){ return 'FavoriteEventHandler'; }
    getClassName(){ return FavoriteEventHandler.getClassName(); }

    static getAccessorName(){ return 'favoriteevent'; }
    getAccessorName(){ return FavoriteEventHandler.getAccessorName(); }

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

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, prettyStanza);
            let children = stanza.children;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "room":
                        break;
                    case "usersettings":
                        // treated also in conversationEventHandler
                        // treated also in invitationEventHandler
                        break;
                    case "userinvite":
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
                        that.onFavoriteManagementMessageReceived(node);
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

    onFavoriteManagementMessageReceived (stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onFavoriteManagementMessageReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

        try {
            let stanzaElem = stanza;
            let favoriteElem = stanzaElem.find("favorite");
            if (favoriteElem) {
                let fav = {
                    "id": favoriteElem.attr("id"),
                    "type": favoriteElem.attr("type"),
                    "peerId": favoriteElem.attr("peer_id"),
                    "position": favoriteElem.attr("position") ? + favoriteElem.attr("position") : undefined
                };
                let action = favoriteElem.attr("action");

                if (action === 'create') {
                    that.eventEmitter.emit("evt_internal_favoritecreated_handle", fav);
                }

                if (action === 'update') {
                    that.eventEmitter.emit("evt_internal_favoriteupdated_handle", fav);
                }

                if (action === 'delete') {
                    that.eventEmitter.emit("evt_internal_favoritedeleted_handle", fav);
                }
            }
            return true;
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onFavoriteManagementMessageReceived) -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onFavoriteManagementMessageReceived) -- failure -- : ", err.message);
            return true;
        }

        /*

        // */
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
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", prettyStanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    };


}

export {FavoriteEventHandler};
module.exports.FavoriteEventHandler = FavoriteEventHandler;
