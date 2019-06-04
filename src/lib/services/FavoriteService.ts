"use strict";
import {accessSync} from "fs";

export {};

//const ErrorCase = require("../common/ErrorManager");
const utils = require("../common/Utils");
const PubSub = require("pubsub-js");

const LOG_ID = "FAVTE/SVCE - ";

import {FavoriteEventHandler} from '../connection/XMPPServiceHandler/favoriteEventHandler';
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

import { Favorite } from '../common/models/Favorite';
import {CallLogEventHandler} from "../connection/XMPPServiceHandler/calllogEventHandler";
import {ErrorManager} from "../common/ErrorManager";
import {Channel} from "../common/models/Channel";

class FavoriteService {
    public _eventEmitter: any;
    private _logger: any;
    private started: boolean;
    private _initialized: boolean;
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _favoriteEventHandler: FavoriteEventHandler;
    private favoriteHandlerToken: any;



    //public static $inject: string[] = ['$http', '$log', 'contactService', 'authService', 'roomService', 'conversationService', 'xmppService'];

    private favorites: any[] = [];
    private xmppManagementHandler: any;

    constructor(_eventEmitter, logger) {

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this._logger = logger;

        this.started = false;
        this._initialized = false;

        //that._eventEmitter.on("rainbow_calllogupdated", that.onCallLogUpdated.bind(that));
        //that._eventEmitter.on("rainbow_calllogackupdated", that.onCallLogAckReceived.bind(that));
        //that._eventEmitter.on("rainbow_oncalllogupdated", that.onIqCallLogNotificationReceived.bind(that));
    }


    async start(_xmpp : XMPPService, _rest : RESTService) {
        let that = this;
        that._xmpp = _xmpp;
        that._rest = _rest;

        this.favoriteHandlerToken = [];

        that._logger.log("info", LOG_ID + " ");
        that._logger.log("info", LOG_ID + "[start] === STARTING ===");
        let startDate = new Date().getTime();
        this.attachHandlers();

        //this.conversationService.favoriteService = this;
        //this.attachHandlers();

        let startDuration = Math.round(new Date().getTime() - startDate);
        //stats.push({ service: 'favoriteService', startDuration: startDuration });
        that._logger.log("info", LOG_ID + `[favoriteService] === STARTED (${startDuration} ms) ===`);
    }

    async stop() {
        let that = this;

        that._logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this.started = false;
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;

        delete that._favoriteEventHandler;
        that._favoriteEventHandler = null;
        that.favoriteHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        that.favoriteHandlerToken = [];

        /*this.$log.info('[favoriteService] Stopping');
        if (this.xmppManagementHandler) {
            this.xmppService.deleteHandler(this.xmppManagementHandler);
            this.xmppManagementHandler = null;
        }
        this.$log.info('[favoriteService] Stopped');

         */


        that._logger.log("info", LOG_ID + "[stop] Stopped");
    }

    async init () {
        let that = this;
        await this.getServerFavorites();
        /*await utils.setTimeoutPromised(3000).then(() => {
            let startDate = new Date();
            that.getCallLogHistoryPage()
                .then(() => {
                    // @ts-ignore
                    let duration = new Date() - startDate;
                    let startDuration = Math.round(duration);
                    that._logger.log("info", LOG_ID + " callLogService start duration : ",  startDuration);
                    that._logger.log("info", LOG_ID + "[start] === STARTED (" + startDuration + " ms) ===");
                    that.started = true;
                })
                .catch(() => {
                    that._logger.log("error", LOG_ID + "[start] === STARTING FAILURE ===");
                });
        });

         */

    }

    attachHandlers() {
        let that = this;

        that._logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._favoriteEventHandler = new FavoriteEventHandler(that._xmpp, that);
        that.favoriteHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._favoriteEventHandler.IQ_CALLLOG, that._favoriteEventHandler.onIqCallLogReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._favoriteEventHandler.CALLLOG_ACK, that._favoriteEventHandler.onCallLogAckReceived ),
            PubSub.subscribe( that._xmpp.hash + "." + that._favoriteEventHandler.IQ_CALLOG_NOTIFICATION, that._favoriteEventHandler.onIqCallLogNotificationReceived )
        ];

        /*
        if (this.xmppManagementHandler) { this.xmppService.deleteHandler(this.xmppManagementHandler); }
        this.xmppManagementHandler = this.xmppService.addHandler((stanza) => { this.onXmppEvent(stanza); return true; }, null, "message", "management");

         */

        /*
        //if reconnection, update the call-logs
        if (that.started && that.lastTimestamp) {
            $interval(function () {
                that.getCallLogHistoryPage(that.lastTimestamp);
            }, 1000, 1, true);
        }
        // */
    }


    public async reconnect() {
        await this.getServerFavorites();
        //this.conversationService.favoriteService = this;
        this.attachHandlers();
    }


    public async getServerFavorites(): Promise<Favorite[]> {
        try {
            let that = this;
            return new Promise(async (resolve, reject) => {
                this._rest.getServerFavorites().then(async (favorite : []) => {
                    that._logger.log("info", LOG_ID + "(getServerFavorites) favorite tab length : ", favorite.length);
                    that._logger.log("debug", LOG_ID + "(getServerFavorites) _exiting_");
                    if (favorite) {
                        let promises = favorite.map(async (data: any) => {
                            return this.createFavorite(data.id, data.peerId, data.type);
                        });
                        let favorites = await Promise.all(promises);
                        this.favorites = favorites.filter((favorite) => {
                            return favorite !== null;
                        });
                        that._logger.log("info", LOG_ID + `[favoriteService] getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
                    }
                    resolve(this.favorites);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getServerFavorites) error : ", err);
                    that._logger.log("debug", LOG_ID + "(getServerFavorites) _exiting_");
                    reject(err);
                });

                /*
//            let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites`;
  //          let response = await this.$http({ method: "GET", url: url, headers: this.authService.getRequestHeader() });
            let promises = response.data.data.map(async (data: any) => { return this.createFavorite(data.id, data.peerId, data.type); });
            let favorites = await Promise.all(promises);
            this.favorites = favorites.filter((favorite) => { return favorite !== null; });
            this.$log.info(`[favoriteService] getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
            return this.favorites;
            */
            });
        }
        catch (error) {
            let errorMessage = `getServerFavorites -- FAILURE -- ${error.message}`;
            this._logger.log("error", LOG_ID + `[favoriteService] CATCH Error !!! : ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    public async addServerFavorite(peerId: string, type: string) {
        let that = this;
        try {
            /*let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites`;
            let data = { peerId, type };
            await this.$http({ method: "POST", url, headers: this.authService.getRequestHeader(), data });

             */
            that._logger.log("debug", LOG_ID +`[favoriteService] addServerFavorite(${peerId}, ${type}) -- SUCCESS`);
        }
        catch (error) {
            let errorMessage = `addServerFavorite(${peerId}, ${type}) -- FAILURE -- ${error.message}`;
            that._logger.log("error", LOG_ID + `[favoriteService] ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    public async removeServerFavorite(favoriteId: string) {
        let that = this;
        try {
            /*
            let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites/${favoriteId}`;
            await this.$http({ method: "DELETE", url: url, headers: this.authService.getRequestHeader() });

             */
            that._logger.log("debug", LOG_ID +`[favoriteService] removeServerFavorite(${favoriteId}) -- SUCCESS`);
        }
        catch (error) {
            let errorMessage = `removeServerFavorite(${favoriteId}) -- FAILURE -- ${error.statusText}`;
            that._logger.log("error", LOG_ID +`[favoriteService] ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    public toggleFavorite(conversation: any): void {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let type = conversation.contact ? (conversation.contact.isBot ? 'bot' : 'user') : 'room';
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (!favorite) { this.addServerFavorite(peerId, type); }
        else { this.removeServerFavorite(favorite.id); }
    }

    public updateFavorites(conversation: any): void {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (favorite) { conversation.isFavorite = true; favorite.conv = conversation; }
    }

    public async getFavorite(peerId: string) {
        let favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        //let convGetter = favorite.contact ? this.conversationService.getOrCreateOneToOneConversation(favorite.contact.jid) : this.conversationService.getRoomConversation(favorite.room.jid);
        //return await convGetter;
    }

    private async createFavorite(id: string, peerId: string, type: string) {
        let that = this;
        try {
            let favorite: any = new Favorite(id, peerId, type);

            /*
            // Get peer object
            if (type === 'room') { favorite.room = this.roomService.getRoomById(peerId); }
            else { favorite.contact = await this.contactService.getContactByDBId(peerId); }

            // Fetch eventual conversation
            let convId: string = favorite.room ? favorite.room.jid : favorite.contact.jid;
            let conv: any = this.conversationService.getConversationById(convId);
            if (conv) { conv.isFavorite = true; favorite.conv = conv; }

             */
            return favorite;
        }
        catch (error) {
            that._logger.log("error", LOG_ID + `[favoriteService] createFavorite(${id}, ${peerId}, ${type}) -- FAILURE -- ${error.message}`);
            return null;
        }
    }

    private async onXmppEvent(stanza) {
        try {/*
            let stanzaElem = $(stanza);
            let favoriteElem = stanzaElem.find("favorite");
            if (favoriteElem) {
                let id = favoriteElem.attr("id");
                let type = favoriteElem.attr("type");
                let peerId = favoriteElem.attr("peer_id");
                let action = favoriteElem.attr("action");

                if (action === 'create') {
                    let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
                    if (!favorite) {
                        favorite = await this.createFavorite(id, peerId, type);
                        this.favorites.push(favorite);
                        this.sendEvent('ON_FAVORITE_CREATED', { favorite });
                    }
                }

                if (action === 'delete') {
                    var index = this.favorites.findIndex((fav) => { return fav.id === id; });
                    if (index !== -1) {
                        var favorite = this.favorites[index];
                        if (favorite.conv) { favorite.conv.isFavorite = false; }
                        this.favorites.splice(index, 1);
                        this.sendEvent('ON_FAVORITE_DELETED', { favoriteId: favorite.id });
                    }
                }
            }
            return true;
            */
        }
        catch (error) { return true; }
    }

    /*private sendEvent(eventName: string, detail: any): void {
        let event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

     */

}

module.exports = FavoriteService;
