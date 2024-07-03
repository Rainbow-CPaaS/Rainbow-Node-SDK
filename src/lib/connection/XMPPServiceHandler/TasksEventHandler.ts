"use strict";
import {XMPPService} from "../XMPPService";
import {XMPPUTils} from "../../common/XMPPUtils";
import {getJsonFromXML, logEntryExit} from "../../common/Utils";
import {GenericHandler} from "./GenericHandler";
import { Core } from "../../Core";
import {ContactsService} from "../../services/ContactsService.js";
import {TaskInput, TasksService} from "../../services/TasksService.js";

export {};


const Utils = require("../../common/Utils");

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/TASKS - ";

@logEntryExit(LOG_ID)
class TasksEventHandler extends GenericHandler {
    public MESSAGE: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public IQ_RESULT: any;
    public IQ_ERROR: any;
    private _core : Core;
    public tasksService: TasksService;
    public contactsService: ContactsService;
    public xmppUtils: XMPPUTils;

    static getClassName(){ return 'TasksEventHandler'; }
    getClassName(){ return TasksEventHandler.getClassName(); }

    static getAccessorName(){ return 'tasksevent'; }
    getAccessorName(){ return TasksEventHandler.getAccessorName(); }

    constructor(xmppService : XMPPService, core: Core) {
        super(xmppService);

        let that = this;
        this.MESSAGE = "jabber:client.message";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this._core = core;
        this.contactsService = core.contacts;
    }

    onIqResultReceived (msg, stanza) {
        let that = this;
        let children = stanza.children;
        children.forEach((node) => {
            switch (node.getName()) {
                case "default":
                    //that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection, onIqResultReceived) not managed - 'stanza'", node.getName());
                    break;
                default:
                //that
                //  .logger
                //.log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) child not managed for iq - 'stanza'", node.getName());
            }
        });
    };

    onErrorMessageReceived (msg, stanza) {
        let that = this;

        try {
            if (stanza.getChild('no-store') != undefined){
                // // Treated in conversation handler that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
            } else {
                // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onMessageReceived(msg, stanza) {
        let that = this;

        return ;

        that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
        try {
            let stanzaElem = stanza;
            //let that = this;

            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onMessageReceived) reqObj : ", reqObj);

            // Ignore "Offline" message
            let delay = stanzaElem.getChild("delay");
            if (delay && delay.text()==="Offline Storage") {
                return true;
            }

            let from = stanza.attrs.from;
            let to = stanza.attrs.to;

        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that._logger.log(that.DEBUG, LOG_ID + "(onMessageReceived) _exiting_");
        return true;
    }

    async onManagementMessageReceived(msg, stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
        try {

            let children = stanza.children;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "room":
                        // treated in conversationEventHandler
                        break;
                    case "usersettings":
                        // treated also in conversationEventHandler
                        // treated also in invitationEventHandler
                        break;
                    case "userinvite":
                        // treated in conversationEventHandler
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
                        // treated in channelEventHandler
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
                        that.onTodosManagementMessageReceived(stanza);
                        break;
                    default:
                        that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) unmanaged management message node " + node.getName());
                        break;
                }
            });

        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that._logger.log(that.DEBUG, LOG_ID + "(onManagementMessageReceived) _exiting_");
        return true;
    }

    async onTodosManagementMessageReceived(stanza) {
        let that = this;
        let stanzaElem = stanza;
        //let that = this;

        let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
        let reqObj = await getJsonFromXML(xmlNodeStr);
        that._logger.log(that.DEBUG, LOG_ID + "(onManagementMessageReceived) reqObj : ", reqObj);

        /*let from = stanza.attrs.from;
        let to = stanza.attrs.to; */

        let message = reqObj?.message
        if (message) {
            let id = message?.todo?.$attrs?.id;
            let action = message?.todo?.$attrs?.action; //"create" ;
            let position = message?.todo?.$attrs?.position; //"0" ;
            let type = message?.todo?.$attrs?.type; //"item" ;
            let category = message?.todo?.$attrs?.category; //"high";
            let content = message?.todo?.content?._;
            let content2 = message?.todo2?.content?._;

            let todo = {
                id, position, type, category, content
            };

            if (action==="create") {
                that._logger.log(that.DEBUG, LOG_ID + "(onTodosManagementMessageReceived) create id : ", id, ", todo received.");
                that._logger.log(that.INTERNAL, LOG_ID + "(onTodosManagementMessageReceived) create id : ", id, ", todo received : ", todo);
                that.eventEmitter.emit("evt_internal_hdle_taskcreated", todo);
            }
            if (action==="delete") {
                that._logger.log(that.DEBUG, LOG_ID + "(onTodosManagementMessageReceived) delete id : ", id, ", todo received.");
                that._logger.log(that.INTERNAL, LOG_ID + "(onTodosManagementMessageReceived) delete id : ", id, ", todo received : ", todo);
                that.eventEmitter.emit("evt_internal_hdle_taskdeleted", todo);
            }
            if (action==="update") {
                that._logger.log(that.DEBUG, LOG_ID + "(onTodosManagementMessageReceived) update id : ", id, ", todo received.");
                that._logger.log(that.INTERNAL, LOG_ID + "(onTodosManagementMessageReceived) update id : ", id, ", todo received : ", todo);
                that.eventEmitter.emit("evt_internal_hdle_taskupdated", todo);
            }
        }
    }
}

module.exports.TasksEventHandler = TasksEventHandler;
export {TasksEventHandler};
