"use strict";
import {Logger} from "../common/Logger";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {logEntryExit, setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {FavoriteEventHandler} from '../connection/XMPPServiceHandler/favoriteEventHandler';
import { Favorite } from '../common/models/Favorite';
import {ErrorManager} from "../common/ErrorManager";
import {isStarted} from "../common/Utils";
import EventEmitter = NodeJS.EventEmitter;
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "FAVTE/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
* @module
* @name FavoritesService
 * @version SDKVERSION
 * @public
* @description
*      This module is the basic module for handling Favorites in Rainbow. In Rainbow, Favorites are the way to list a most frequent, most used or the most important conversations, bubbles and bots.
*      The main methods and events proposed in that service allow to: <br>
*      - Create or delete a Rainbow Favorite (one-to-one, bubble or bot), <br/>
*      - Retrieve all information linked to that Favorite, <br>
*/
class FavoritesService {
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    private started: boolean;
    private _initialized: boolean;
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    private _favoriteEventHandler: FavoriteEventHandler;
    private _favoriteHandlerToken: any;
    //public static $inject: string[] = ['$http', '$log', 'contactService', 'authService', 'roomService', 'conversationService', 'xmppService'];
    private favorites: any[] = [];
    private _xmppManagementHandler: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter, logger : Logger, _startConfig) {

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = logger;

        this.started = false;
        this._initialized = false;

        this._eventEmitter.on("evt_internal_favoritecreated_handle", this.onFavoriteCreated.bind(this));
        this._eventEmitter.on("evt_internal_favoritedeleted_handle", this.onFavoriteDeleted.bind(this));
        this.ready = false;
    }


    public async start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;
        that._xmpp = _core._xmpp;
        that._rest = _core._rest;
        that._options = _options;
        that._s2s = _core._s2s;
        that._useXMPP = that._options.useXMPP;
        that._useS2S = that._options.useS2S;
        this._favoriteHandlerToken = [];

        that._logger.log("info", LOG_ID + " ");
        that._logger.log("info", LOG_ID + "[start] === STARTING ===");
        let startDate = new Date().getTime();
        this.attachHandlers();

        //this.conversationService.favoriteService = this;
        //this.attachHandlers();

        let startDuration = Math.round(new Date().getTime() - startDate);
        //stats.push({ service: 'favoriteService', startDuration: startDuration });
        that._logger.log("info", LOG_ID + `=== STARTED (${startDuration} ms) ===`);
        this.ready = true;

    }

    public async stop() {
        let that = this;

        that._logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this.started = false;
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;

        delete that._favoriteEventHandler;
        that._favoriteEventHandler = null;
        if (that._favoriteHandlerToken) {
            that._favoriteHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        }
        that._favoriteHandlerToken = [];

        /*this.$log.info('Stopping');
        if (this._xmppManagementHandler) {
            this.xmppService.deleteHandler(this._xmppManagementHandler);
            this._xmppManagementHandler = null;
        }
        this.$log.info('Stopped');

         */


        this.ready = false;
        that._logger.log("info", LOG_ID + "[stop] Stopped");
    }

    public async init () {
        let that = this;
        await this.getServerFavorites();
        /*await setTimeoutPromised(3000).then(() => {
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

    private attachHandlers() {
        let that = this;

        that._logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._favoriteEventHandler = new FavoriteEventHandler(that._xmpp, that);
        that._favoriteHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._favoriteEventHandler.MESSAGE_MANAGEMENT, that._favoriteEventHandler.onManagementMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._favoriteEventHandler.MESSAGE_ERROR, that._favoriteEventHandler.onErrorMessageReceived)
        ];

        /*
        if (this._xmppManagementHandler) { this.xmppService.deleteHandler(this._xmppManagementHandler); }
        this._xmppManagementHandler = this.xmppService.addHandler((stanza) => { this.onXmppEvent(stanza); return true; }, null, "message", "management");

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


    private async getServerFavorites(): Promise<Favorite[]> {
        try {
            let that = this;
            return new Promise(async (resolve, reject) => {
                this._rest.getServerFavorites().then(async (favorite : []) => {
                    that._logger.log("info", LOG_ID + "(getServerFavorites) favorite tab length : ", favorite.length);
                    if (favorite) {
                        let promises = favorite.map(async (data: any) => {
                            return this.createFavoriteObj(data.id, data.peerId, data.type);
                        });
                        let favorites = await Promise.all(promises);
                        this.favorites = favorites.filter((favorite) => {
                            return favorite !== null;
                        });
                        that._logger.log("info", LOG_ID + `getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
                    }
                    resolve(this.favorites);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getServerFavorites) error.");
                    that._logger.log("internalerror", LOG_ID + "(getServerFavorites) error : ", err);
                    return reject(err);
                });

                /*
//            let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites`;
  //          let response = await this.$http({ method: "GET", url: url, headers: this.authService.getRequestHeader() });
            let promises = response.data.data.map(async (data: any) => { return this.createFavorite(data.id, data.peerId, data.type); });
            let favorites = await Promise.all(promises);
            this.favorites = favorites.filter((favorite) => { return favorite !== null; });
            this.$log.info(`getServerFavorites -- SUCCESS -- found ${this.favorites.length} favorites`);
            return this.favorites;
            */
            });
        }
        catch (error) {
            let errorMessage = `getServerFavorites -- FAILURE -- ${error.message}`;
            this._logger.log("error", LOG_ID + `[getServerFavorites] CATCH Error !!! `);
            this._logger.log("internalerror", LOG_ID + `CATCH Error !!! : ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async addServerFavorite(peerId: string, type: string) {
        let that = this;
        try {
            let favorite = await that._rest.addServerFavorite(peerId, type);
            that._logger.log("internal", LOG_ID +`addServerFavorite(${peerId}, ${type}) -- SUCCESS`, favorite);
            return favorite;
        }
        catch (error) {
            let errorMessage = `addServerFavorite(${peerId}, ${type}) -- FAILURE -- ${error.message}`;
            that._logger.log("error", LOG_ID + `[addServerFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID + `${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async removeServerFavorite(favoriteId: string) {
        let that = this;
        try {
            return new Promise(async (resolve, reject) => {
                that._rest.removeServerFavorite(favoriteId).then(async (favoriteDeleted ) => {
                    that._logger.log("info", LOG_ID +"(removeServerFavorite) -- SUCCESS.");
                    that._logger.log("internal", LOG_ID +"(removeServerFavorite) -- SUCCESS : ", favoriteDeleted);
                    resolve(favoriteDeleted);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(removeServerFavorite) error.");
                    that._logger.log("internalerror", LOG_ID + "(removeServerFavorite) error : ", err);
                    return reject(err);
                });

            });
        }
        catch (error) {
            let errorMessage = `removeServerFavorite(${favoriteId}) -- FAILURE -- ${error.statusText}`;
            that._logger.log("error", LOG_ID +`[removeServerFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID +`${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    private async toggleFavorite(conversation: any): Promise<any> {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let type = conversation.contact ? (conversation.contact.isBot ? 'bot' : 'user') : 'room';
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (!favorite) {
            return this.addServerFavorite(peerId, type);
        } else {
            return this.removeServerFavorite(favorite.id);
        }
    }

    private updateFavorites(conversation: any): void {
        let peerId = conversation.contact ? conversation.contact.dbId : conversation.room.dbId;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        if (favorite) { conversation.isFavorite = true; favorite.conv = conversation; }
    }

    private async getFavorite(peerId: string) {
        let favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === peerId; });
        //let convGetter = favorite.contact ? this.conversationService.getOrCreateOneToOneConversation(favorite.contact.jid) : this.conversationService.getRoomConversation(favorite.room.jid);
        //return await convGetter;
    }

    private async createFavoriteObj(id: string, peerId: string, type: string) {
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
            that._logger.log("error", LOG_ID + `[createFavorite] Error.`);
            that._logger.log("internalerror", LOG_ID + `createFavorite(${id}, ${peerId}, ${type}) -- FAILURE -- ${error.message}`);
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
                    let index = this.favorites.findIndex((fav) => { return fav.id === id; });
                    if (index !== -1) {
                        let favorite = this.favorites[index];
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


    /**
     * @public
     * @since 1.56
     * @method fetchAllFavorites()
     * @instance
     * @description
     *   Fetch all the Favorites from the server in a form of an Array
     * @return {Conversation[]} An array of Favorite objects
     */
    public async fetchAllFavorites() {
        let that = this;

        return new Promise((resolve, reject) => {
            that.getServerFavorites()
                .then(function(favorites) {
                    that._logger.log("debug", LOG_ID + `[fetchAllFavorites] :: Successfully fetched the Favorites`);
                    that._logger.log("internal", LOG_ID + `[fetchAllFavorites] :: Successfully fetched the Favorites : `, favorites);
                    resolve(favorites)
                })
                .catch(function(err) {
                    that._logger.log("error", LOG_ID + `[fetchAllFavorites] :: Error.`);
                    that._logger.log("internalerror", LOG_ID + `[fetchAllFavorites] :: ERROR : `, err);
                    return reject(err)
                })
        });
    };

    /**
     * @public
     * @since 1.56
     * @method createFavorite()
     * @instance
     * @description
     *   Add conversation/bubble/bot to Favorites Array
     * @param {String} id of the conversation/bubble
     * @param {String} type of Favorite (can be 'user' or 'bubble')
     * @return {Promise<Favorite>} A Favorite object
     */
    public async createFavorite(id, type) : Promise<Favorite> {
        let that = this;

        return new Promise((resolve, reject) => {

            if (!id) {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: parameter 'id' is missing or null");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!type) {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: parameter 'type' is missing or null");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (type !== "bubble" && type !== "user") {
                that._logger.log("debug", LOG_ID + "[createFavorite] :: Error: type should be set to \"user\" or \"bubble\"");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (type === "bubble") {
                type = "room"
            }

            that.addServerFavorite(id, type).then((favorite: any) => {
                that._logger.log("debug", LOG_ID + `[createFavorite] :: Successfully added ${type} to favorites`);
                return resolve(favorite);
            }).catch(err => {
                that._logger.log("error", LOG_ID + "[createFavorite] :: Error.");
                that._logger.log("internalerror", LOG_ID + "[createFavorite] :: Error : ", err);
                return reject(err)
            })

        });
    };

    /**
     * @public
     * @since 1.56
     * @method deleteFavorite()
     * @instance
     * @description
     *   Delete conversation/bubble/bot from Favorites Array
     * @param {String} id of the Favorite item
     * @return {Favorite[]} A Favorite object
     */
    async deleteFavorite(id) : Promise<any>{
        let that = this;
        return new Promise((resolve, reject) => {
            if (!id) {
                that._logger.log("debug", LOG_ID + "[deleteFavorite] :: Error: parameter 'id' is missing or null");
                return reject("[deleteFavorite] :: Error: parameter 'id' is missing or null");
            }

            that.removeServerFavorite(id)
                .then((favDeleted) => {
                    return resolve(favDeleted)
                })
                .catch(err => {
                    that._logger.log("error", LOG_ID + "[deleteFavorite] :: Error.");
                    that._logger.log("internalerror", LOG_ID + "[deleteFavorite] :: Error : ", err);
                    return reject(err)
                })
        })
    }

    // ******************* Event XMPP parsed in favoriteEventHandler ***************
    public async  onFavoriteCreated(fav: {id:string, peerId: string, type: string}): Promise<void> {
        let that = this;
        let favorite: Favorite = this.favorites.find((favoriteConv: any) => { return favoriteConv.peerId === fav.peerId; });
        if (!favorite) {
            favorite = await this.createFavoriteObj(fav.id, fav.peerId, fav.type);
            this.favorites.push(favorite);
            //that._logger.log("internal", LOG_ID + "[onFavoriteCreated] send event : ", favorite);
            //this.sendEvent('ON_FAVORITE_CREATED', { favorite });

            that._eventEmitter.emit("evt_internal_favoritecreated", favorite);
        }
    }

    public async onFavoriteDeleted(fav: {id:string, peerId: string, type: string}): Promise<void> {
        let that = this;
        let index = this.favorites.findIndex((fav) => { return fav.id === fav.id; });
        if (index !== -1) {
            let favorite = this.favorites[index];
            if (favorite.conv) { favorite.conv.isFavorite = false; }
            this.favorites.splice(index, 1);
            //that._logger.log("debug", LOG_ID + "[onFavoriteDeleted] send event : ", { favoriteId: favorite.id });
            //this.sendEvent('ON_FAVORITE_DELETED', { favoriteId: favorite.id });
            that._eventEmitter.emit("evt_internal_favoritedeleted", fav);
        }
    }
}

module.exports.FavoritesService = FavoritesService;
export {FavoritesService};
