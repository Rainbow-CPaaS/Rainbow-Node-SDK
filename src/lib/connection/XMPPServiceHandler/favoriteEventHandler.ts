"use strict";
import {RESTService} from "../RESTService";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

const GenericHandler = require("./genericHandler");
import {Conversation} from "../../common/models/Conversation";
import {Channel} from "../../common/models/Channel";
import {logEntryExit} from "../../common/Utils";

const util = require('util');

const xml = require("@xmpp/xml");

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
    public eventEmitter: any;
    public onManagementMessageReceived: any;
    public onFavoriteManagementMessageReceived: any;
    public onHeadlineMessageReceived: any;
    public onReceiptMessageReceived: any;
    public onErrorMessageReceived: any;
    public findAttrs: any;
    public findChildren: any;

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

        this.onManagementMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza);
                let children = stanza.children;
                children.forEach(function (node) {
                    switch (node.getName()) {
                        case "room":
                            break;
                        case "usersettings":
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
                        case "favorite":
                            that.onFavoriteManagementMessageReceived(node);
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

        this.onFavoriteManagementMessageReceived = (stanza) => {
            that.logger.log("internal", LOG_ID + "(onFavoriteManagementMessageReceived) _entering_ : ", stanza);

            try {
                let stanzaElem = stanza;
                let favoriteElem = stanzaElem.find("favorite");
                if (favoriteElem) {
                    let fav = {
                        "id": favoriteElem.attr("id"),
                        "type": favoriteElem.attr("type"),
                        "peerId": favoriteElem.attr("peer_id"),
                    };
                    let action = favoriteElem.attr("action");

                    if (action === 'create') {
                        that.eventEmitter.emit("evt_internal_favoritecreated_handle", fav);
                    }

                    if (action === 'delete') {
                        that.eventEmitter.emit("evt_internal_favoritedeleted_handle", fav);
                    }
                }
                return true;
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onFavoriteManagementMessageReceived) -- failure -- ");
                that.logger.log("internalerror", LOG_ID + "(onFavoriteManagementMessageReceived) -- failure -- : ", err.message);
                return true;
            }

            /*

            // */
        };


        this.onReceiptMessageReceived = (msg, stanza) => {
        };

        this.onErrorMessageReceived = (msg, stanza) => {
            try {
                if (stanza.getChild('no-store') != undefined){
                    // // Treated in conversation handler that.logger.log("error", LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
                } else {
                    that.logger.log("error", LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                    that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, stanza);
                    that.eventEmitter.emit("evt_internal_xmpperror", msg);
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
            }
        };

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
}

export {FavoriteEventHandler};
module.exports.FavoriteEventHandler = FavoriteEventHandler;
